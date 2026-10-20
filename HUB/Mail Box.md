---
cssclasses:
  - hide-properties_editing
  - hide-properties_reading
---

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Mail Box Helpers"));

////////////////////////////////////////////////////
///             Initial Settings                 ///
////////////////////////////////////////////////////

const initialSettings = {
  placeholders: {
    nameFilter: "Search files...",
    pathFilter: "Enter path...",
    dateFilter: "Enter date (YYYY-MM-DD)...",
    headerTitle: "Inbox",
  },
  pagination: {
    isEnabled: true,
    itemsPerPage: 7,
  },
  sortBy: "mtime", // 'mtime' for last modified, 'ctime' for creation date
  sortOrder: "desc", // 'desc' for descending, 'asc' for ascending
};

////////////////////////////////////////////////////
///                 Components                   ///
////////////////////////////////////////////////////

const Link = ({ path, children }) => (
  <a target="_blank" rel="noopener" data-tooltip-position="top" data-href={path} className="internal-link">
    {children}
  </a>
);

const FolderPath = ({ path, date, sortBy }) => (
  <div style={styles.folderPathContainer}>
    <div>{H.getFullPath(path)}</div>
    <div>{sortBy === 'mtime' ? 'Last modified: ' : 'Creation Date: '}{H.formatDate(date)}</div>
  </div>
);

const Checkbox = ({ entry, onUpdate }) => {
  const [error, setError] = dc.useState("");
  const isChecked = H.isEntryChecked(entry);
  const icon = isChecked ? 'lucide-check-circle' : 'circle';

  const handleClick = async () => {
    setError("");
    try {
      const action = await H.toggleEntry(app, entry);
      if (!action) return;
      const iconic = app.plugins.getPlugin('iconic');
      if (iconic) {
        iconic.saveFileIcon({ id: entry.$path }, action.icon, null);
        iconic.refreshIcons();
      }
      onUpdate();
    } catch (error) {
      setError(error.message || "Could not update this task.");
    }
  };

  return (
    <span>
      <button type="button" aria-label={isChecked ? 'Restore task' : 'Complete task'} onClick={handleClick} style={{ marginRight: '5px', cursor: 'pointer' }}>
        <dc.Icon icon={icon} className="icon-in-link" />
      </button>
      {error && <span role="alert">{error}</span>}
    </span>
  );
};

const Row = ({ entry, onUpdate, sortBy }) => {
  return (
    <div style={styles.row}>
      <Checkbox entry={entry} onUpdate={onUpdate} />
      <Link path={entry.$path}>{entry.$name}</Link>
      <FolderPath path={entry.$path} date={sortBy === 'mtime' ? entry.$mtime : entry.$ctime} sortBy={sortBy} />
    </div>
  );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange, pageInput, setPageInput, totalEntries }) => (
  <div style={styles.pagination}>
    <dc.Button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      style={styles.button}
    >
      Previous
    </dc.Button>
    <span style={styles.paginationText}>
      Page {currentPage} of {totalPages}
    </span>
    <dc.Textbox
      type="number"
      min="1"
      max={totalPages}
      value={pageInput}
      placeholder="Page #"
      onChange={(e) => setPageInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const pageNumber = parseInt(pageInput, 10);
          if (!isNaN(pageNumber)) onPageChange(pageNumber);
        }
      }}
      style={styles.paginationTextbox}
    />
    <dc.Button
      onClick={() => {
        const pageNumber = parseInt(pageInput, 10);
        if (!isNaN(pageNumber)) onPageChange(pageNumber);
      }}
      style={styles.button}
    >
      Go
    </dc.Button>
    <dc.Button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      style={styles.button}
    >
      Next
    </dc.Button>
    <span style={styles.totalEntries}>Total Entries: {totalEntries}</span>
  </div>
);

////////////////////////////////////////////////////
///             Main View Component              ///
////////////////////////////////////////////////////

function Inbox() {
  const { useState, useMemo, useCallback } = dc;
  const [nameFilter, setNameFilter] = useState("");
  const [pathFilter, setPathFilter] = useState("");
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [paginationEnabled, setPaginationEnabled] = useState(initialSettings.pagination.isEnabled);
  const [itemsPerPage, setItemsPerPage] = useState(initialSettings.pagination.itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const [sortBy, setSortBy] = useState(initialSettings.sortBy);
  const [sortOrder, setSortOrder] = useState(initialSettings.sortOrder);
  const [dateFilter, setDateFilter] = useState("");
  const [isDateBefore, setIsDateBefore] = useState(false);

  const query = dc.useQuery(H.buildMailboxQuery(), [updateTrigger, pathFilter, showCompleted]);

  const filteredData = useMemo(() => {
    return query
      .filter(entry => entry.$name.toLowerCase().includes(nameFilter.toLowerCase()))
      .filter(entry => H.mailboxIncludes(entry, showCompleted, pathFilter))
      .filter(entry => {
        if (!dateFilter) return true;
        
        const entryDate = sortBy === 'mtime' ? entry.$mtime : entry.$ctime;
        const filterDate = dc.luxon.DateTime.fromFormat(dateFilter, "yyyy-MM-dd");
        
        if (!filterDate.isValid) return true;
        
        return isDateBefore 
          ? entryDate <= filterDate.endOf('day')
          : entryDate >= filterDate.startOf('day');
      })
      .sort((a, b) => {
        const dateA = sortBy === 'mtime' ? a.$mtime : a.$ctime;
        const dateB = sortBy === 'mtime' ? b.$mtime : b.$ctime;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [query, nameFilter, pathFilter, sortBy, sortOrder, showCompleted, dateFilter, isDateBefore]);

  const totalPages = useMemo(() => {
    return paginationEnabled ? Math.max(1, Math.ceil(filteredData.length / itemsPerPage)) : 1;
  }, [filteredData, paginationEnabled, itemsPerPage]);

  // Keep the selected page valid when filters or task counts change.
  const effectivePage = H.clampPage(currentPage, totalPages);
  dc.useEffect(() => { setCurrentPage(1); setPageInput(""); }, [nameFilter, pathFilter, showCompleted, dateFilter, isDateBefore, itemsPerPage, paginationEnabled]);
  dc.useEffect(() => { setCurrentPage(effectivePage); }, [effectivePage]);

  const paginatedData = useMemo(() => {
    if (!paginationEnabled) return filteredData;
    const start = (effectivePage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, paginationEnabled, effectivePage, itemsPerPage]);

  const handleUpdate = useCallback(() => setUpdateTrigger(prev => prev + 1), []);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setPageInput("");
    }
  }, [totalPages]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>{initialSettings.placeholders.headerTitle}</h1>
      <div style={styles.controls}>
        <dc.Textbox
          type="search"
          placeholder={initialSettings.placeholders.nameFilter}
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          style={styles.searchBox}
        />
        <dc.Textbox
          type="search"
          placeholder={initialSettings.placeholders.pathFilter}
          value={pathFilter}
          onChange={(e) => setPathFilter(e.target.value)}
          style={styles.searchBox}
        />
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          Completions
        </label>
      </div>
      <div style={styles.secondaryControls}>
        <div style={styles.dateFilterContainer}>
          <dc.Textbox
            type="search"
            placeholder={initialSettings.placeholders.dateFilter}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={styles.dateFilterBox}
          />
          <button 
            onClick={() => setIsDateBefore(!isDateBefore)} 
            style={{
              ...styles.button,
              ...styles.dateToggleButton,
              backgroundColor: isDateBefore ? 'var(--interactive-accent)' : 'var(--background-modifier-border-focus)',
            }}
          >
            {isDateBefore ? 'Before' : 'After'}
          </button>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} style={styles.button}>
          {isEditing ? "Finish Editing" : "Edit"}
        </button>
      </div>
      {isEditing && (
        <div style={styles.editingControls}>
          <label>
            <input
              type="checkbox"
              checked={paginationEnabled}
              onChange={(e) => setPaginationEnabled(e.target.checked)}
            />
            Enable Pagination
          </label>
          {paginationEnabled && (
            <dc.Textbox
              type="number"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
              style={styles.numberInput}
              min="1"
            />
          )}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
            <option value="mtime">Sort by Last Modified</option>
            <option value="ctime">Sort by Creation Date</option>
          </select>
          <button onClick={toggleSortOrder} style={styles.button}>
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      )}
      <div style={styles.rowsContainer}>
        {paginatedData.map((entry) => (
          <Row key={entry.$path} entry={entry} onUpdate={handleUpdate} sortBy={sortBy} />
        ))}
      </div>
      {paginationEnabled && (
        <PaginationControls
          currentPage={effectivePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageInput={pageInput}
          setPageInput={setPageInput}
          totalEntries={filteredData.length}
        />
      )}
    </div>
  );
}

////////////////////////////////////////////////////
///                   Styles                     ///
////////////////////////////////////////////////////

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "var(--background-primary)",
    color: "var(--text-normal)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: { marginBottom: "20px" },
  controls: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  searchBox: {
    flex: 1,
    padding: "8px",
    border: "1px solid var(--background-modifier-border)",
    borderRadius: "4px",
    backgroundColor: "var(--background-primary)",
    color: "var(--text-normal)",
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "var(--interactive-accent)",
    color: "var(--text-on-accent)",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  editingControls: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    alignItems: "center",
  },
  numberInput: {
    width: "60px",
    padding: "4px",
  },
  select: {
    padding: "4px",
  },
  rowsContainer: {
    flex: 1,
    overflowY: "auto",
  },
  row: {
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid var(--background-modifier-border)",
  },
  folderPathContainer: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "20px",
    color: "var(--text-muted)",
    fontSize: "0.9em",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px",
  },
  paginationText: {
    margin: "0 10px",
  },
  paginationTextbox: {
    width: "60px",
    padding: "4px",
  },
  totalEntries: {
    marginLeft: "20px",
  },
  secondaryControls: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    alignItems: "center",
  },
  dateFilterContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
  },
  dateFilterBox: {
    flex: 1,
    padding: "8px",
    border: "1px solid var(--background-modifier-border)",
    borderRadius: "4px",
    backgroundColor: "var(--background-primary)",
    color: "var(--text-normal)",
  },
  dateToggleButton: {
    minWidth: "80px",
    padding: "6px 12px",
    transition: "background-color 0.3s",
  },
};

return <Inbox />;
```
