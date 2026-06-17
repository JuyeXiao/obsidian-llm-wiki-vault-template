---
cssclasses:
  - hide-properties_editing
  - hide-properties_reading
---

```datacorejsx
////////////////////////////////////////////////////
///             Initial Settings                 ///
////////////////////////////////////////////////////

const initialSettings = {
  vaultName: "Dusk_empty", // Replace with your actual vault name
  queryPath: "",
  initialNameFilter: "",
  dynamicColumnProperties: {
    "File Name": "name.obsidian",
    "Tags": "tags",
    "Area": "area",
    "Category": "category",
    "Last Modified": "mtime.obsidian",
    "Creation Date": "ctime.obsidian",
    "File Type": "type",
  },
  groupByColumns: [],
  pagination: {
    isEnabled: true,
    itemsPerPage: 7,
  },
  viewHeight: "600px",
  placeholders: {
    nameFilter: "Search notes...",
    queryPath: "Enter path...",
    headerTitle: "Map of Content",
    newHeaderLabel: "New Header Label",
    newDataField: "New Data Field",
  },
  excludedFolders: ["SYSTEM", "HUB", "DAILY"], // Add folders to exclude here, e.g. ["Personal", "Archive"]
};

////////////////////////////////////////////////////
///               Helper Functions               ///
////////////////////////////////////////////////////


const { useState, useMemo, useEffect } = dc; // Assuming 'dc' is the Dataview context

function getProperty(entry, property) {
  if (property.endsWith(".obsidian")) {
    const key = property.replace(".obsidian", "");
    const obsidianProps = {
      ctime: entry.$ctime?.toISODate() || "Unknown Date",
      mtime: entry.$mtime?.toISODate() || "Unknown Last Modified Date",
      name: entry.$name || "Unnamed",
    };
    return obsidianProps[key] || "No Data";
  }

  // Handle tags property
  if (property === "tags") {
    const tags = entry.$tags || [];
    if (Array.isArray(tags) && tags.length > 0) {
      return tags;
    }
    return [];
  }

  const frontmatterField = entry.$frontmatter?.[property];
  if (frontmatterField !== undefined) {
    if (
      frontmatterField &&
      typeof frontmatterField === "object" &&
      frontmatterField.hasOwnProperty("value")
    ) {
      const value = frontmatterField.value;
      if (Array.isArray(value)) {
        return value.join(", ");
      } else if (value !== null && value !== undefined) {
        return value.toString();
      }
    } else if (Array.isArray(frontmatterField)) {
      return frontmatterField.join(", ");
    } else if (
      typeof frontmatterField === "string" ||
      typeof frontmatterField === "number"
    ) {
      return frontmatterField.toString();
    } else if (frontmatterField !== null && frontmatterField !== undefined) {
      return frontmatterField.toString();
    }
  }

  return " ";
}

function getColumnStyle(columnId) {
  const styleMap = {
    "File Name": { flex: "2.5 1 280px", minWidth: "220px" },
    "Tags": { flex: "2.5 1 250px", minWidth: "200px" },
    "Area": { flex: "1.3 1 130px", minWidth: "110px" },
    "Category": { flex: "1.3 1 130px", minWidth: "110px" },
    "Last Modified": { flex: "1.6 1 160px", minWidth: "140px" },
    "Creation Date": { flex: "1.6 1 160px", minWidth: "140px" },
    "File Type": { flex: "1.1 1 110px", minWidth: "90px" },
  };
  return styleMap[columnId] || { flex: "1 1 150px", minWidth: "100px" };
}

////////////////////////////////////////////////////
///                 Components                   ///
////////////////////////////////////////////////////

function TagsCell({ tags }) {
  const [showAll, setShowAll] = useState(false);
  const maxVisible = 3;
  
  if (!tags || (Array.isArray(tags) && tags.length === 0)) {
    return <span style={{ color: "var(--text-faint)", fontSize: "0.9em" }}>No tags</span>;
  }
  
  const tagArray = Array.isArray(tags) ? tags : [tags];
  const visibleTags = showAll ? tagArray : tagArray.slice(0, maxVisible);
  const hasMore = tagArray.length > maxVisible;
  
  return (
    <div style={{ 
      display: "flex", 
      flexWrap: "wrap", 
      gap: "3px", 
      alignItems: "center",
      maxWidth: "100%",
      padding: "2px 0",
    }}>
      {visibleTags.map((tag, idx) => (
        <span 
          key={idx} 
          style={{
            padding: "1px 6px",
            backgroundColor: "var(--tag-background, var(--background-secondary))",
            color: "var(--tag-color, var(--text-normal))",
            borderRadius: "8px",
            fontSize: "0.8em",
            border: "1px solid var(--background-modifier-border)",
            whiteSpace: "nowrap",
            display: "inline-block",
            maxWidth: "80px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: "1.3",
          }}
          title={tag.replace('#', '')}
        >
          {tag.replace('#', '')}
        </span>
      ))}
      
      {hasMore && !showAll && (
        <span 
          onClick={() => setShowAll(true)}
          style={{
            padding: "1px 6px",
            backgroundColor: "var(--background-modifier-border)",
            color: "var(--text-muted)",
            borderRadius: "8px",
            fontSize: "0.8em",
            cursor: "pointer",
            border: "1px solid var(--background-modifier-border)",
            lineHeight: "1.3",
          }}
          title={`Show ${tagArray.length - maxVisible} more tags`}
        >
          +{tagArray.length - maxVisible}
        </span>
      )}
      
      {showAll && hasMore && (
        <span 
          onClick={() => setShowAll(false)}
          style={{
            padding: "1px 6px",
            backgroundColor: "var(--background-modifier-border)",
            color: "var(--text-muted)",
            borderRadius: "8px",
            fontSize: "0.8em",
            cursor: "pointer",
            border: "1px solid var(--background-modifier-border)",
            lineHeight: "1.3",
          }}
          title="Show less"
        >
          Show less
        </span>
      )}
    </div>
  );
}

function DraggableLink({ entry, title }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", `[[${title}]]`);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <a
      href="#"
      className="internal-link"
      draggable
      onDragStart={handleDragStart}
      data-href={entry.$path || title}
      data-type="file"
      title={`Drag to copy [[${title}]]`}
      style={styles.draggableLink}
    >
      {title}
    </a>
  );
}

function EditableCell({ entry, property, onUpdate }) {
  const [value, setValue] = useState(getProperty(entry, property));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(getProperty(entry, property));
  }, [entry, property]);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(entry, property, value);
  };

  return isEditing ? (
    <dc.Textbox
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      autoFocus
      style={styles.cellTextbox}
    />
  ) : (
    <div
      style={styles.tableCellContent}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value}
    </div>
  );
}

function EditableHeader({ columnId, editedHeaders, setEditedHeaders }) {
  const [isEditing, setIsEditing] = useState(false);
  const [headerValue, setHeaderValue] = useState(
    editedHeaders[columnId] || columnId
  );

  const handleBlur = () => {
    const trimmedValue = headerValue.trim();
    if (trimmedValue === "") {
      alert("Header name cannot be empty.");
      setHeaderValue(editedHeaders[columnId] || columnId);
    } else {
      setIsEditing(false);
      setEditedHeaders((prev) => ({
        ...prev,
        [columnId]: trimmedValue,
      }));
    }
  };

  return isEditing ? (
    <dc.Textbox
      value={headerValue}
      onChange={(e) => setHeaderValue(e.target.value)}
      onBlur={handleBlur}
      autoFocus
      placeholder="Edit header..."
      style={styles.headerTextbox}
    />
  ) : (
    <label
      style={styles.editBlockHeader}
      onClick={() => setIsEditing(true)}
      title="Click to edit header"
    >
      {headerValue}
    </label>
  );
}

function EditColumnBlock(props) {
  const {
    columnId,
    index,
    columnsToShow,
    setColumnsToShow,
    editedHeaders,
    setEditedHeaders,
    editedFields,
    setEditedFields,
    updateColumn,
    removeColumn,
    dynamicColumnProperties,
    groupByColumns,
    setGroupByColumns,
    groupSortOrders,
    setGroupSortOrders,
  } = props;

  const isGrouped = groupByColumns.includes(columnId);
  const groupIndex = groupByColumns.indexOf(columnId) + 1;
  const sortOrder = groupSortOrders[columnId] || "asc";

  const handleDragStart = (e) => {
    e.dataTransfer.setData("dragIndex", index);
  };

  const handleDrop = (e) => {
    const dragIndex = e.dataTransfer.getData("dragIndex");
    if (dragIndex === "") return;
    const parsedDragIndex = parseInt(dragIndex, 10);
    if (isNaN(parsedDragIndex)) return;
    const newColumns = [...columnsToShow];
    const draggedColumn = newColumns[parsedDragIndex];
    newColumns.splice(parsedDragIndex, 1);
    newColumns.splice(index, 0, draggedColumn);
    setColumnsToShow(newColumns);
  };

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setGroupSortOrders({
      ...groupSortOrders,
      [columnId]: newSortOrder,
    });
  };

  const handleDataFieldChange = (e) => {
    const newField = e.target.value;
    setEditedFields((prev) => ({
      ...prev,
      [columnId]: newField,
    }));
  };

  const handleDataFieldUpdate = () => {
    const newField =
      editedFields[columnId] || dynamicColumnProperties[columnId];
    updateColumn(columnId, editedHeaders[columnId] || columnId, newField);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      style={styles.editBlock}
    >
      <div style={styles.editBlockHeaderContainer}>
        <EditableHeader
          columnId={columnId}
          editedHeaders={editedHeaders}
          setEditedHeaders={setEditedHeaders}
        />
      </div>
      <div style={styles.inlineButtonGroup}>
        <button
          onClick={() => {
            handleDataFieldUpdate();
          }}
          style={styles.inlineButton}
        >
          Update
        </button>
        <button
          onClick={() => removeColumn(columnId)}
          style={styles.inlineButton}
        >
          Remove
        </button>
        <button
          onClick={() =>
            setGroupByColumns(
              isGrouped
                ? groupByColumns.filter((col) => col !== columnId)
                : [...groupByColumns, columnId]
            )
          }
          style={{
            ...styles.inlineButton,
            backgroundColor: isGrouped 
              ? "var(--background-modifier-border)"
              : "var(--interactive-accent)",
            color: isGrouped
              ? "var(--text-normal)"
              : "var(--text-on-accent)",
          }}
          data-active={isGrouped}
        >
          {isGrouped ? "Ungroup" : "Group By"}
        </button>
      </div>
      {isGrouped && (
        <div style={styles.groupOrderControls}>
          <span style={styles.groupOrderLabel}>Group Order: {groupIndex}</span>
          <button
            onClick={() =>
              setGroupByColumns((prev) => {
                const idx = prev.indexOf(columnId);
                if (idx > 0) {
                  const newGroup = [...prev];
                  [newGroup[idx - 1], newGroup[idx]] = [
                    newGroup[idx],
                    newGroup[idx - 1],
                  ];
                  return newGroup;
                }
                return prev;
              })
            }
            disabled={groupByColumns.indexOf(columnId) === 0}
            style={styles.buttonSmall}
          >
            ↑
          </button>
          <button
            onClick={() =>
              setGroupByColumns((prev) => {
                const idx = prev.indexOf(columnId);
                if (idx < prev.length - 1) {
                  const newGroup = [...prev];
                  [newGroup[idx], newGroup[idx + 1]] = [
                    newGroup[idx + 1],
                    newGroup[idx],
                  ];
                  return newGroup;
                }
                return prev;
              })
            }
            disabled={
              groupByColumns.indexOf(columnId) === groupByColumns.length - 1
            }
            style={styles.buttonSmall}
          >
            ↓
          </button>
          <button onClick={toggleSortOrder} style={styles.buttonSmall}>
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>
        </div>
      )}
      <div style={styles.dataFieldContainer}>
        <dc.Textbox
          value={editedFields[columnId] || dynamicColumnProperties[columnId]}
          onChange={handleDataFieldChange}
          placeholder="Data Field..."
          style={styles.dataFieldTextbox}
          onBlur={handleDataFieldUpdate}
          autoFocus={false}
        />
      </div>
    </div>
  );
}

function AddColumn({
  newHeaderLabel,
  setNewHeaderLabel,
  newFieldLabel,
  setNewFieldLabel,
  addNewColumn,
}) {
  return (
    <div style={styles.addColumnContainer}>
      <div style={styles.editBlock}>
        <div style={styles.editBlockHeaderContainer}>
          <label style={styles.editBlockHeader}>Add New Column</label>
        </div>
        <div style={styles.addColumnInputs}>
          <dc.Textbox
            value={newHeaderLabel}
            onChange={(e) => setNewHeaderLabel(e.target.value)}
            placeholder="New Header Label"
            style={styles.addColumnTextbox}
          />
          <dc.Textbox
            value={newFieldLabel}
            onChange={(e) => setNewFieldLabel(e.target.value)}
            placeholder="New Data Field"
            style={styles.addColumnTextbox}
          />
        </div>
        <div style={styles.addColumnButtonContainer}>
          <button onClick={addNewColumn} style={styles.centeredAddButton}>
            Add Column
          </button>
        </div>
      </div>
    </div>
  );
}

function PaginationSettings({
  isEnabled,
  setIsEnabled,
  itemsPerPage,
  setItemsPerPage,
}) {
  const pageSizeOptions = [5, 7, 10, 15, 20, 30, 50, 100];
  
  return (
    <div style={styles.paginationSettingsContainer}>
      <div style={styles.paginationMain}>
        <div style={styles.paginationLeft}>
          <label style={styles.paginationTitle}>Pagination:</label>
          <dc.Checkbox
            label="Enable"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            style={{ marginLeft: "10px" }}
          />
        </div>
        {isEnabled && (
          <div style={styles.paginationRight}>
            <label style={styles.paginationLabel}>Items per Page:</label>
            <select 
              value={itemsPerPage} 
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={styles.selectCompact}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size} items</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

function DataTable({
  columnsToShow,
  dynamicColumnProperties,
  data,
  groupByColumns,
  groupSortOrders,
  onUpdateEntry,
}) {
  return (
    <div style={styles.tableContainer}>
      <div style={styles.tableHeader}>
        {columnsToShow.map((col) => (
          <div key={col} style={{
            ...styles.tableHeaderCell,
            ...getColumnStyle(col)
          }}>
            {col}
          </div>
        ))}
      </div>
      <div style={styles.tableContent}>
        {data.length > 0 ? (
          <RenderRows
            data={data}
            columnsToShow={columnsToShow}
            dynamicColumnProperties={dynamicColumnProperties}
            groupByColumns={groupByColumns}
            groupSortOrders={groupSortOrders}
            onUpdateEntry={onUpdateEntry}
          />
        ) : (
          <div style={styles.noData}>
            <div>📁 No files found</div>
            <div style={{ fontSize: "0.9em", marginTop: "10px", color: "var(--text-faint)" }}>
              Try adjusting your search filters or path
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RenderRows({
  data,
  columnsToShow,
  dynamicColumnProperties,
  groupByColumns,
  groupSortOrders,
  onUpdateEntry,
  groupLevel = 0,
}) {
  if (groupByColumns.length === 0) {
    return data.map((entry, idx) => {
      // Retrieve key properties to ensure this is an existing note
      const name = getProperty(entry, "name.obsidian");
      const mtime = getProperty(entry, "mtime.obsidian");
      const ctime = getProperty(entry, "ctime.obsidian");

      // Skip non-existing notes that have placeholder values
      if (name === "Unnamed" || mtime === "Unknown Last Modified Date" || ctime === "Unknown Date") {
        return null; // Prevent rendering
      }

      return (
        <div key={idx} style={styles.tableRow}>
          {columnsToShow.map((columnId) => {
            const property = dynamicColumnProperties[columnId];
            return (
              <div key={columnId} style={{
                ...styles.tableCell,
                ...getColumnStyle(columnId)
              }}>
                {property === "name.obsidian" ? (
                  <DraggableLink
                    entry={entry}
                    title={getProperty(entry, property)}
                  />
                ) : property === "tags" ? (
                  <TagsCell tags={getProperty(entry, property)} />
                ) : (
                  <EditableCell
                    entry={entry}
                    property={property}
                    onUpdate={onUpdateEntry}
                  />
                )}
              </div>
            );
          })}
        </div>
      );
    });
  } else {
    const groupKey = groupByColumns[0];
    const property = dynamicColumnProperties[groupKey];
    const sortOrder = groupSortOrders[groupKey] || "asc";
    const groups = {};

    data.forEach((entry) => {
      // Retrieve key properties to ensure this is an existing note
      const name = getProperty(entry, "name.obsidian");
      const mtime = getProperty(entry, "mtime.obsidian");
      const ctime = getProperty(entry, "ctime.obsidian");

      // Exclude entries with placeholder values directly in the grouping stage
      if (name === "Unnamed" || mtime === "Unknown Last Modified Date" || ctime === "Unknown Date") {
        return; // Skip this entry
      }

      if (property === "tags") {
        // Special handling for tags - group by individual tags
        const tags = getProperty(entry, property) || [];
        const tagArray = Array.isArray(tags) ? tags : [tags];
        
        if (tagArray.length === 0) {
          // No tags - group under "Untagged"
          if (!groups["Untagged"]) groups["Untagged"] = [];
          groups["Untagged"].push(entry);
        } else {
          // Each tag creates a group, entry may appear in multiple groups
          tagArray.forEach(tag => {
            const tagName = tag.replace('#', '');
            if (!groups[tagName]) groups[tagName] = [];
            // Check if entry is already in this group to avoid duplicates
            if (!groups[tagName].some(e => e.$path === entry.$path)) {
              groups[tagName].push(entry);
            }
          });
        }
      } else {
        // Regular grouping for non-tags properties
        const key = getProperty(entry, property) || "Uncategorized";
        if (!groups[key]) groups[key] = [];
        groups[key].push(entry);
      }
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (a < b) return sortOrder === "asc" ? -1 : 1;
      if (a > b) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sortedKeys.map((key, idx) => (
      <div key={idx}>
        <div
          style={{
            ...styles.groupHeader,
            paddingLeft: `${groupLevel * 20}px`,
          }}
        >
          {key}
        </div>
        <RenderRows
          data={groups[key]}
          columnsToShow={columnsToShow}
          dynamicColumnProperties={dynamicColumnProperties}
          groupByColumns={groupByColumns.slice(1)}
          groupSortOrders={groupSortOrders}
          onUpdateEntry={onUpdateEntry}
          groupLevel={groupLevel + 1}
        />
      </div>
    ));
  }
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageInput,
  setPageInput,
  totalEntries,
}) {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          style={{
            ...styles.pageNumberButton,
            backgroundColor: currentPage === 1 ? "var(--interactive-accent)" : "transparent",
            color: currentPage === 1 ? "var(--text-on-accent)" : "var(--text-normal)",
          }}
        >
          1
        </button>
      );
      if (start > 2) {
        pages.push(<span key="dots1" style={{ padding: "0 8px" }}>...</span>);
      }
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          style={{
            ...styles.pageNumberButton,
            backgroundColor: currentPage === i ? "var(--interactive-accent)" : "transparent",
            color: currentPage === i ? "var(--text-on-accent)" : "var(--text-normal)",
          }}
        >
          {i}
        </button>
      );
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(<span key="dots2" style={{ padding: "0 8px" }}>...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          style={{
            ...styles.pageNumberButton,
            backgroundColor: currentPage === totalPages ? "var(--interactive-accent)" : "transparent",
            color: currentPage === totalPages ? "var(--text-on-accent)" : "var(--text-normal)",
          }}
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };
  
  return (
    <div style={styles.pagination}>
      {totalPages > 1 ? (
        <div style={styles.paginationControls}>
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            style={{
              ...styles.button,
              padding: "6px 12px",
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ⟨⟨
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              ...styles.button,
              padding: "6px 12px",
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ⟨
          </button>
          
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {renderPageNumbers()}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              ...styles.button,
              padding: "6px 12px",
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            ⟩
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            style={{
              ...styles.button,
              padding: "6px 12px",
              opacity: currentPage === totalPages ? 0.5 : 1,
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            ⟩⟩
          </button>
          
          <div style={{ marginLeft: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={styles.paginationText}>
              Jump to:
            </span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              placeholder="#"
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const pageNumber = parseInt(pageInput, 10);
                  if (!isNaN(pageNumber)) onPageChange(pageNumber);
                }
              }}
              style={{ ...styles.paginationTextbox, width: "60px" }}
            />
          </div>
        </div>
      ) : (
        <span style={{ color: "var(--text-muted)" }}>
          Total Entries: <strong>{totalEntries}</strong>
        </span>
      )}
    </div>
  );
}

////////////////////////////////////////////////////
///                   Styles                     ///
////////////////////////////////////////////////////

const styles = {
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--background-primary)",
    color: "var(--text-normal)",
    height: "100%",
  },
  header: {
    padding: "10px",
    backgroundColor: "var(--background-primary)",
  },
  headerTitle: {
    margin: 0,
    paddingBottom: "10px",
  },
  controlGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  textbox: {
    padding: "8px 12px",
    border: "1px solid var(--background-modifier-border)",
    backgroundColor: "var(--background-primary)",
    color: "var(--text-normal)",
    borderRadius: "6px",
    width: "200px",
    height: "42px",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
    outline: "none",
    fontSize: "14px",
  },
  headerTextbox: {
    padding: "4px 6px",
    border: "1px solid var(--background-modifier-border)",
    backgroundColor: "var(--background-secondary)",
    color: "var(--text-normal)",
    width: "100%",
    boxSizing: "border-box",
    fontSize: "14px",
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "var(--interactive-accent)",
    color: "var(--text-on-accent)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    flex: "0 1 auto",
    textAlign: "center",
    fontWeight: "500",
    fontSize: "14px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  addNewFileButton: {
    padding: "8px 12px",
    backgroundColor: "grey",
    color: "var(--text-on-accent)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    flex: "0 1 auto",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "14px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  buttonSmall: {
    padding: "4px 6px",
    backgroundColor: "var(--interactive-accent)",
    color: "var(--text-on-accent)",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "12px",
    flex: "0 0 auto",
  },
  editBlock: {
    flex: "0 0 auto",
    padding: "10px",
    border: "1px solid var(--background-modifier-border)",
    marginBottom: "10px",
    backgroundColor: "var(--background-secondary)",
    color: "var(--text-normal)",
    borderRadius: "8px",
    cursor: "grab",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: "250px",
  },
  editBlockHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editBlockHeader: {
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  editBlockSubheader: {
    color: "var(--text-faint)",
    fontSize: "12px",
    marginBottom: "3px",
  },
  editingContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    padding: "5px",
    overflowX: "auto",
  },
  inlineButtonGroup: {
    display: "flex",
    flexDirection: "row",
    gap: "5px",
    alignItems: "center",
    flexWrap: "wrap",
    width: "100%",
  },
  inlinePagination: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    marginTop: "5px",
  },
  inlineButton: {
    flex: "1",
    padding: "6px 10px",
    backgroundColor: "var(--interactive-accent)",
    color: "var(--text-on-accent)",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "12px",
    textAlign: "center",
    fontWeight: "bold",
    '&:active': {
      opacity: 0.8,
    },
    '&[data-active="true"]': {
      backgroundColor: "var(--interactive-accent-hover)",
    },
  },
  addColumnContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
  },
  addColumnInputs: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
  },
  addColumnTextbox: {
    flex: "1",
    padding: "8px",
    border: "1px solid var(--background-modifier-border)",
    backgroundColor: "var(--background-primary)",
    color: "var(--text-normal)",
    boxSizing: "border-box",
  },
  addColumnButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: "10px",
  },
  centeredAddButton: {
    padding: "8px 16px",
    backgroundColor: "var(--interactive-accent)",
    color: "var(--text-on-accent)",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    flex: "0 0 auto",
    fontWeight: "bold",
  },
  groupOrderControls: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    flexWrap: "wrap",
    marginTop: "5px",
  },
  groupOrderLabel: {
    fontSize: "12px",
    color: "var(--text-faint)",
  },
  select: {
    appearance: "none",
    WebkitAppearance: "none",
    padding: "8px 32px 8px 12px",
    border: "1px solid var(--background-modifier-border)",
    backgroundColor: "var(--background-primary)",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5l5 5 5-5' fill='none' stroke='%23888888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    color: "var(--text-normal)",
    borderRadius: "6px",
    width: "160px",
    height: "42px",
    boxSizing: "border-box",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.2s ease",
    fontSize: "14px",
  },
  selectCompact: {
    appearance: "none",
    WebkitAppearance: "none",
    padding: "6px 26px 6px 10px",
    borderRadius: "4px",
    border: "1px solid var(--background-modifier-border)",
    backgroundColor: "var(--background-primary)",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1.5l5 5 5-5' fill='none' stroke='%23888888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    color: "var(--text-normal)",
    cursor: "pointer",
    fontSize: "14px",
  },
  paginationTitle: {
    fontSize: "14px",
    fontWeight: "bold",
  },
  paginationLabel: {
    fontSize: "14px",
    color: "var(--text-normal)",
  },
  paginationTextbox: {
    width: "60px",
    padding: "8px",
    border: "1px solid var(--background-modifier-border)",
    backgroundColor: "var(--background-primary)",
    color: "var(--text-normal)",
    boxSizing: "border-box",
  },
  paginationSettingsContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  paginationMain: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "nowrap",
    width: "100%",
  },
  paginationLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  paginationRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  tableAndPaginationContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  tableContainer: {
    flex: 1,
    overflowY: "auto",
    position: "relative",
  },
  tableHeader: {
    display: "flex",
    backgroundColor: "var(--background-primary)",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  tableHeaderCell: {
    flex: "1 1 auto",
    minWidth: "100px",
    padding: "12px 10px",
    fontWeight: "600",
    textAlign: "left",
    borderBottom: "2px solid var(--background-modifier-border)",
    backgroundColor: "var(--background-secondary)",
    position: "sticky",
    top: 0,
    zIndex: 10,
    fontSize: "0.95em",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "var(--text-muted)",
  },
  tableContent: {
    display: "flex",
    flexDirection: "column",
  },
  tableRow: {
    display: "flex",
    borderBottom: "1px solid var(--background-modifier-border)",
    transition: "background-color 0.15s ease",
    cursor: "pointer",
    minHeight: "45px",
    alignItems: "flex-start",
    padding: "8px 0",
  },
  tableRowHover: {
    backgroundColor: "var(--background-modifier-hover)",
  },
  tableCell: {
    flex: "1 1 auto",
    minWidth: "100px",
    padding: "8px 10px",
    overflow: "visible",
    display: "flex",
    alignItems: "flex-start",
  },
  tableCellContent: {
    cursor: "pointer",
  },
  cellTextbox: {
    width: "100%",
    padding: "5px",
    boxSizing: "border-box",
  },
  groupHeader: {
    padding: "12px 16px",
    backgroundColor: "var(--background-secondary)",
    fontWeight: "600",
    fontSize: "0.95em",
    borderBottom: "2px solid var(--background-modifier-border)",
    borderLeft: "4px solid var(--interactive-accent)",
    position: "sticky",
    top: 0,
    zIndex: 1,
    flex: "1 0 100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  noData: {
    padding: "40px 20px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "1.1em",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "60px",
    color: "var(--text-muted)",
  },
  pagination: {
    backgroundColor: "var(--background-primary)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px",
    gap: "10px",
    borderTop: "1px solid var(--background-modifier-border)",
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  paginationText: {
    margin: "0 10px",
    verticalAlign: "middle",
  },
  pageNumberButton: {
    padding: "4px 10px",
    margin: "0 2px",
    border: "1px solid var(--background-modifier-border)",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "14px",
    minWidth: "32px",
  },
  draggableLink: {
    cursor: "pointer",
    textDecoration: "underline",
    color: "var(--interactive-accent)",
  },
  dataFieldContainer: {
    marginTop: "10px",
  },
  dataFieldTextbox: {
    width: "100%",
    padding: "5px",
    boxSizing: "border-box",
  },
};

////////////////////////////////////////////////////
///             Main View Component              ///
////////////////////////////////////////////////////

function View({ initialSettingsOverride = {}, app }) {
  const mergedSettings = useMemo(() => {
    return {
      ...initialSettings,
      ...initialSettingsOverride,
      pagination: {
        ...initialSettings.pagination,
        ...initialSettingsOverride.pagination,
      },
      placeholders: {
        ...initialSettings.placeholders,
        ...initialSettingsOverride.placeholders,
      },
      dynamicColumnProperties: initialSettingsOverride.dynamicColumnProperties
        ? { ...initialSettingsOverride.dynamicColumnProperties }
        : { ...initialSettings.dynamicColumnProperties },
      vaultName: initialSettingsOverride.vaultName
        ? initialSettingsOverride.vaultName
        : initialSettings.vaultName,
      excludedFolders: initialSettingsOverride.excludedFolders
        ? [...initialSettingsOverride.excludedFolders]
        : [...initialSettings.excludedFolders],
    };
  }, [initialSettingsOverride]);

  const [nameFilter, setNameFilter] = useState(
    mergedSettings.initialNameFilter || ""
  );
  const [queryPath, setQueryPath] = useState(mergedSettings.queryPath);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHeaders, setEditedHeaders] = useState({});
  const [editedFields, setEditedFields] = useState({});
  const [newHeaderLabel, setNewHeaderLabel] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const [isPaginationEnabled, setIsPaginationEnabled] = useState(
    mergedSettings.pagination.isEnabled
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    mergedSettings.pagination.itemsPerPage
  );
  const [groupByColumns, setGroupByColumns] = useState(
    mergedSettings.groupByColumns
  );
  const [groupSortOrders, setGroupSortOrders] = useState({});
  const [dynamicColumnProperties, setDynamicColumnProperties] = useState(
    mergedSettings.dynamicColumnProperties
  );
  const [columnsToShow, setColumnsToShow] = useState(
    Object.keys(mergedSettings.dynamicColumnProperties)
  );

  useEffect(() => {
    setColumnsToShow(Object.keys(dynamicColumnProperties));
  }, [dynamicColumnProperties]);

  const qdata = dc.useQuery(`@page and path("${queryPath}")`);

  const filteredData = useMemo(() => {
    return qdata.filter((entry) => {
      const searchTerm = nameFilter.toLowerCase();
      const isExcluded = mergedSettings.excludedFolders.some(folder => 
        entry.$path.startsWith(folder + '/')
      );

      if (isExcluded) return false;

      const matchesSearch = Object.values(dynamicColumnProperties).some(property => {
        const value = getProperty(entry, property);
        return value.toString().toLowerCase().includes(searchTerm);
      });

      const title = getProperty(entry, "name.obsidian");
      const isUnnamed = title === "Unnamed";
      const hasData = Object.keys(dynamicColumnProperties).some((header) => {
        const property = dynamicColumnProperties[header];
        const value = getProperty(entry, property);
        return value !== "No Data";
      });

      return matchesSearch && !isUnnamed && hasData;
    });
  }, [qdata, nameFilter, dynamicColumnProperties, mergedSettings.excludedFolders]);

  const groupedData = useMemo(() => {
    const flattenData = (data, groupKeys, level = 0) => {
      if (groupKeys.length === 0) return data;
      const groupKey = groupKeys[0];
      const property = dynamicColumnProperties[groupKey];
      const sortOrder = groupSortOrders[groupKey] || "asc";
      const groups = {};
      data.forEach((entry) => {
        const key = getProperty(entry, property) || "Uncategorized";
        if (!groups[key]) groups[key] = [];
        groups[key].push(entry);
      });
      const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (a < b) return sortOrder === "asc" ? -1 : 1;
        if (a > b) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
      let result = [];
      sortedKeys.forEach((key) => {
        result.push({ type: "group", level, key });
        result = result.concat(
          flattenData(groups[key], groupKeys.slice(1), level + 1)
        );
      });
      return result;
    };
    return flattenData(filteredData, groupByColumns);
  }, [filteredData, groupByColumns, dynamicColumnProperties, groupSortOrders]);

  const paginatedData = useMemo(() => {
    if (isPaginationEnabled) {
      const start = (currentPage - 1) * itemsPerPage;
      const end = currentPage * itemsPerPage;
      return groupedData.slice(start, end);
    } else {
      return groupedData;
    }
  }, [groupedData, currentPage, itemsPerPage, isPaginationEnabled]);

  const totalPages = useMemo(() => {
    if (isPaginationEnabled) {
      const totalEntries = groupedData.filter((item) => item.type !== "group")
        .length;
      return Math.ceil(totalEntries / itemsPerPage);
    } else {
      return 1;
    }
  }, [groupedData, itemsPerPage, isPaginationEnabled]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setPageInput("");
    } else {
      alert("Invalid page number.");
    }
  };

  const addNewColumn = () => {
    if (!newHeaderLabel || !newFieldLabel) {
      alert("Please provide both a new header label and a data field.");
      return;
    }
    if (columnsToShow.includes(newHeaderLabel)) {
      alert("Header label already exists. Please choose a different name.");
      return;
    }
    const updatedColumns = {
      ...dynamicColumnProperties,
      [newHeaderLabel]: newFieldLabel,
    };
    setDynamicColumnProperties(updatedColumns);
    setColumnsToShow([...columnsToShow, newHeaderLabel]);
    setNewHeaderLabel("");
    setNewFieldLabel("");
  };

  const updateColumn = (columnId, newHeader, newField) => {
    if (newHeader !== columnId && columnsToShow.includes(newHeader)) {
      alert(
        `Header "${newHeader}" already exists. Please choose a different name.`
      );
      setEditedHeaders((prev) => ({
        ...prev,
        [columnId]: columnId,
      }));
      return;
    }

    setDynamicColumnProperties((prev) => {
      const updated = { ...prev };
      delete updated[columnId];
      updated[newHeader] = newField;
      return updated;
    });

    setColumnsToShow((prev) =>
      prev.map((col) => (col === columnId ? newHeader : col))
    );

    setGroupByColumns((prev) =>
      prev.map((col) => (col === columnId ? newHeader : col))
    );

    setEditedHeaders((prev) => {
      const newHeaders = { ...prev };
      delete newHeaders[columnId];
      return newHeaders;
    });
    setEditedFields((prev) => {
      const newFields = { ...prev };
      delete newFields[columnId];
      return newFields;
    });
  };

  const removeColumn = (columnId) => {
    const confirmDelete = confirm(
      `Are you sure you want to remove "${columnId}"?`
    );
    if (!confirmDelete) return;

    const updatedColumns = { ...dynamicColumnProperties };
    delete updatedColumns[columnId];
    setDynamicColumnProperties(updatedColumns);
    setColumnsToShow(columnsToShow.filter((col) => col !== columnId));
    setGroupByColumns(groupByColumns.filter((col) => col !== columnId));

    setEditedHeaders((prev) => {
      const newHeaders = { ...prev };
      delete newHeaders[columnId];
      return newHeaders;
    });
    setEditedFields((prev) => {
      const newFields = { ...prev };
      delete newFields[columnId];
      return newFields;
    });
  };

  const onUpdateEntry = (entry, property, newValue) => {
    console.log(`Updating ${entry.$name}: Set ${property} to ${newValue}`);
    // Implement the actual update logic here
  };

  const handleAddNewFile = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Q',
      code: 'KeyQ',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  const totalEntries = groupedData.filter((item) => item.type !== "group")
    .length;

  return (
    <dc.Stack
      style={{ ...styles.mainContainer, height: mergedSettings.viewHeight }}
    >
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>
          {mergedSettings.placeholders.headerTitle}
        </h1>
        <dc.Group style={styles.controlGroup}>
          <dc.Textbox
            type="search"
            placeholder={mergedSettings.placeholders.nameFilter}
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.textbox}
          />
          <dc.Textbox
            value={queryPath}
            placeholder={mergedSettings.placeholders.queryPath}
            onChange={(e) => {
              setQueryPath(e.target.value);
              setCurrentPage(1);
            }}
            style={styles.textbox}
          />
          <select 
            value={groupByColumns[0] || ""}
            onChange={(e) => {
              if (e.target.value) {
                setGroupByColumns([e.target.value]);
              } else {
                setGroupByColumns([]);
              }
            }}
            style={styles.select}
          >
            <option value="">No Grouping</option>
            {Object.keys(dynamicColumnProperties).map(col => (
              <option key={col} value={col}>Group by {col}</option>
            ))}
          </select>
          <dc.Button
            onClick={() => setIsEditing(!isEditing)}
            style={styles.button}
          >
            {isEditing ? "Finish Editing" : "Edit"}
          </dc.Button>
          <dc.Button
            onClick={handleAddNewFile}
            style={styles.addNewFileButton}
          >
            Add New File
          </dc.Button>
        </dc.Group>
        {isEditing && (
          <dc.Group style={styles.controlGroup}>
            <PaginationSettings
              isEnabled={isPaginationEnabled}
              setIsEnabled={setIsPaginationEnabled}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
            />
          </dc.Group>
        )}
        {isEditing && (
          <div style={styles.editingContainer}>
            {columnsToShow.map((columnId, index) => (
              <EditColumnBlock
                key={columnId}
                columnId={columnId}
                index={index}
                columnsToShow={columnsToShow}
                setColumnsToShow={setColumnsToShow}
                editedHeaders={editedHeaders}
                setEditedHeaders={setEditedHeaders}
                editedFields={editedFields}
                setEditedFields={setEditedFields}
                updateColumn={updateColumn}
                removeColumn={removeColumn}
                dynamicColumnProperties={dynamicColumnProperties}
                groupByColumns={groupByColumns}
                setGroupByColumns={setGroupByColumns}
                groupSortOrders={groupSortOrders}
                setGroupSortOrders={setGroupSortOrders}
              />
            ))}
            <AddColumn
              newHeaderLabel={newHeaderLabel}
              setNewHeaderLabel={setNewHeaderLabel}
              newFieldLabel={newFieldLabel}
              setNewFieldLabel={setNewFieldLabel}
              addNewColumn={addNewColumn}
            />
          </div>
        )}
      </div>

      <div style={styles.tableAndPaginationContainer}>
        <DataTable
          columnsToShow={columnsToShow}
          dynamicColumnProperties={dynamicColumnProperties}
          data={paginatedData}
          groupByColumns={groupByColumns}
          groupSortOrders={groupSortOrders}
          onUpdateEntry={onUpdateEntry}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageInput={pageInput}
          setPageInput={setPageInput}
          totalEntries={totalEntries}
        />
      </div>
    </dc.Stack>
  );
}

return View;
```
