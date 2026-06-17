---
cssclasses:
  - hide-properties_editing
  - hide-properties_reading
summary: Tag navigation center — tag statistics, hierarchical tree, untagged-file management, and tagging conventions, powered by Datacore.
---
 # 🏷️ Tag Navigator

> 📍 **About**: This is your tag management and navigation center, helping you quickly browse and manage every tag in your vault.

---

## 📊 Tag Statistics

> [!info]+ 📈 Overview
> ```datacorejsx
> return function TagStatistics() {
>     // Get all files (excluding system and journal folders)
>     const allFiles = dc.useQuery('@page and !path("SYSTEM") and !path("DAILY") and !path("HUB") and $name != "Tag Navigator" and contains($path, "/")');
>     
>     // Compute statistics
>     const stats = dc.useMemo(() => {
>         let taggedCount = 0;
>         let untaggedCount = 0;
>         const uniqueTags = new Set();
>         
>         allFiles.forEach(file => {
>             const tags = file.value('$tags') || [];
>             if (tags && tags.length > 0) {
>                 taggedCount++;
>                 tags.forEach(tag => uniqueTags.add(tag));
>             } else {
>                 untaggedCount++;
>             }
>         });
>         
>         return [
>             { indicator: '📁 Total files', count: allFiles.length },
>             { indicator: '🏷️ Tagged files', count: taggedCount },
>             { indicator: '❌ Untagged files', count: untaggedCount },
>             { indicator: '🎯 Unique tags', count: uniqueTags.size }
>         ];
>     }, [allFiles]);
>     
>     return (
>         <div style={{marginBottom: '20px'}}>
>             {stats.map(stat => (
>                 <div key={stat.indicator} style={{
>                     display: 'flex', 
>                     justifyContent: 'space-between', 
>                     padding: '8px 12px',
>                     margin: '4px 0',
>                     backgroundColor: 'var(--background-secondary)',
>                     borderRadius: '6px',
>                     fontSize: '14px'
>                 }}>
>                     <span style={{fontWeight: '500'}}>{stat.indicator}</span>
>                     <span style={{fontWeight: 'bold', color: 'var(--text-accent)'}}>{stat.count}</span>
>                 </div>
>             ))}
>         </div>
>     );
> }
> ```

---

## 🗄️ Tag Hierarchy Tree

> [!database]+ 🏷️ Tag Hierarchy Tree
> 
> ```datacorejsx
> return function TagTreeStructure() {
>     // Get all files
>     const allFiles = dc.useQuery('@page and !path("SYSTEM") and !path("DAILY") and !path("HUB") and contains($path, "/")');
>     
>     // Build the tree data structure
>     const tagTree = dc.useMemo(() => {
>         const tree = {};
>         const tagFileMap = new Map(); // stores the files for each full tag path
>         
>         // Collect all tags and build the tree
>         allFiles.forEach(file => {
>             const tags = file.value('$tags') || [];
>             if (tags && tags.length > 0) {
>                 tags.forEach(tag => {
>                     const tagStr = String(tag);
>                     // Only handle topic tags
>                     if (tagStr.includes('topic/')) {
>                         const cleanTag = tagStr.startsWith('#') ? tagStr.substring(1) : tagStr;
>                         
>                         // Record the files for this full tag path
>                         if (!tagFileMap.has(cleanTag)) {
>                             tagFileMap.set(cleanTag, []);
>                         }
>                         tagFileMap.get(cleanTag).push(file);
>                         
>                         // Build the tree structure
>                         const parts = cleanTag.split('/');
>                         let current = tree;
>                         
>                         parts.forEach((part, index) => {
>                             if (!current[part]) {
>                                 current[part] = {
>                                     name: part,
>                                     children: {},
>                                     files: [],
>                                     totalFiles: 0,
>                                     path: parts.slice(0, index + 1).join('/')
>                                 };
>                             }
>                             current = current[part].children;
>                         });
>                     }
>                 });
>             }
>         });
>         
>         // Compute the total file count for each node
>         function calculateFileCounts(node) {
>             let count = 0;
>             
>             // Get files tagged directly at this path
>             const nodePath = node.path;
>             if (tagFileMap.has(nodePath)) {
>                 node.files = tagFileMap.get(nodePath);
>                 count += node.files.length;
>             }
>             
>             // Recursively count child nodes
>             Object.values(node.children).forEach(child => {
>                 count += calculateFileCounts(child);
>             });
>             
>             node.totalFiles = count;
>             return count;
>         }
>         
>         // Compute counts for all nodes
>         Object.values(tree).forEach(rootNode => {
>             calculateFileCounts(rootNode);
>         });
>         
>         return tree;
>     }, [allFiles]);
>     
>     // Expand/collapse state
>     const [expanded, setExpanded] = dc.useState({});
>     
>     // Toggle expand state
>     const toggleExpand = (path) => {
>         setExpanded(prev => ({
>             ...prev,
>             [path]: !prev[path]
>         }));
>     };
>     
>     // Recursively render a tree node
>     const renderTreeNode = (node, level = 0) => {
>         const hasChildren = Object.keys(node.children).length > 0;
>         const isExpanded = expanded[node.path];
>         const isMobile = document.body.classList.contains('is-mobile'); const indent = (isMobile ? Math.min(level, 4) : level) * (isMobile ? 12 : 20);
>         
>         // Pick an icon based on level
>         const icon = level === 0 ? '📁' : (hasChildren ? '📂' : '🏷️');
>         const expandIcon = hasChildren ? (isExpanded ? '▼' : '▶') : '　';
>         
>         return (
>             <div key={node.path} style={{marginBottom: '2px'}}>
>                 <div 
>                     style={{
>                         padding: '4px 8px',
>                         marginLeft: `${indent}px`,
>                         cursor: hasChildren ? 'pointer' : 'default',
>                         display: 'flex',
>                         alignItems: 'center',
>                         backgroundColor: 'var(--background-secondary)',
>                         borderRadius: '4px',
>                         marginBottom: '2px',
>                         transition: 'background-color 0.2s'
>                     }}
>                     onClick={() => hasChildren && toggleExpand(node.path)}
>                     onMouseEnter={(e) => {
>                         if (hasChildren) {
>                             e.currentTarget.style.backgroundColor = 'var(--background-modifier-hover)';
>                         }
>                     }}
>                     onMouseLeave={(e) => {
>                         e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
>                     }}
>                 >
>                     <span style={{marginRight: '8px', fontSize: '12px', width: '16px'}}>
>                         {expandIcon}
>                     </span>
>                     <span style={{marginRight: '8px'}}>{icon}</span>
>                     <span style={{flex: 1, fontWeight: level === 0 ? 'bold' : 'normal'}}>
>                         {node.name}
>                     </span>
>                     <span style={{
>                         backgroundColor: 'var(--background-primary)',
>                         padding: '2px 8px',
>                         borderRadius: '12px',
>                         fontSize: '12px',
>                         fontWeight: 'bold',
>                         color: 'var(--text-accent)'
>                     }}>
>                         {node.totalFiles}
>                     </span>
>                 </div>
>                 
>                 {/* If this is a leaf node and expanded, show the file list */}
>                 {!hasChildren && isExpanded && node.files.length > 0 && (
>                     <div style={{
>                         marginLeft: `${indent + (isMobile ? 20 : 40)}px`,
>                         marginTop: '4px',
>                         marginBottom: '8px',
>                         fontSize: '13px'
>                     }}>
>                         {node.files.slice(0, 5).map((file, idx) => (
>                             <div key={idx} style={{marginBottom: '2px'}}>
>                                 📄 {file.$link}
>                             </div>
>                         ))}
>                         {node.files.length > 5 && (
>                             <div style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>
>                                 ...and {node.files.length - 5} more files
>                             </div>
>                         )}
>                     </div>
>                 )}
>                 
>                 {/* Recursively render child nodes */}
>                 {hasChildren && isExpanded && (
>                     <div>
>                         {Object.values(node.children)
>                             .sort((a, b) => b.totalFiles - a.totalFiles)
>                             .map(child => renderTreeNode(child, level + 1))}
>                     </div>
>                 )}
>             </div>
>         );
>     };
>     
>     // Get root nodes and sort
>     const rootNodes = Object.values(tagTree).sort((a, b) => b.totalFiles - a.totalFiles);
>     
>     return (
>         <div>
>             <div style={{marginBottom: '15px', fontSize: '12px', color: 'var(--text-muted)'}}>
>                 📊 Found {rootNodes.length} root tag categories | Click a folder icon to expand/collapse
>             </div>
>             
>             {rootNodes.length > 0 ? (
>                 <div style={{
>                     maxHeight: document.body.classList.contains('is-mobile') ? 'min(600px, 70vh)' : '600px',
>                     overflowY: 'auto',
>                     padding: '10px',
>                     backgroundColor: 'var(--background-primary)',
>                     borderRadius: '8px',
>                     border: '1px solid var(--background-modifier-border)'
>                 }}>
>                     {rootNodes.map(node => renderTreeNode(node))}
>                 </div>
>             ) : (
>                 <p style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>
>                     No files with topic tags yet. Make sure files have tags starting with "topic/".
>                 </p>
>             )}
>         </div>
>     );
> }
> ```

---
## 📝 Untagged File Management

> [!warning]+ ❌ Untagged Files — Need Attention
> 
> ```datacorejsx
> return function AllUntaggedFiles() {
>     const allFiles = dc.useQuery('@page and $name != "Tag Navigator" and !path("SYSTEM") and !path("DAILY") and !path("HUB") and contains($path, "/")');
>     
>     // Filter out files with no tags or empty tags
>     const untaggedFiles = dc.useMemo(() => {
>         return allFiles.filter(file => {
>             const tags = file.value('$tags') || [];
>             return !tags || tags.length === 0;
>         });
>     }, [allFiles]);
>     
>     const sortedFiles = dc.useArray(untaggedFiles, array => array.sort(file => file.$ctime, "desc").slice(0, 15));
>     
>     const columns = [
>         { id: 'name', title: '📋 File Name', value: file => file.$link, width: '40%' },
>         { 
>             id: 'folder', 
>             title: '📁 Folder', 
>             value: file => file.$path.split('/').slice(0, -1).join('/') || 'Root', 
>             width: '35%' 
>         },
>         { id: 'ctime', title: '📅 Created', value: file => new Date(file.$ctime).toLocaleDateString('en-US'), width: '25%' }
>     ];
>     
>     return (
>         <div>
>             {sortedFiles.length > 0 ? (
>                 <div>
>                     <dc.Table rows={sortedFiles} columns={columns} paging={15} />
>                     <div style={{marginTop: '15px', padding: '12px', backgroundColor: 'var(--background-secondary)', borderRadius: '8px', fontSize: '14px'}}>
>                         <strong>🚀 Tagging tips:</strong>
>                         <ul style={{marginTop: '8px', marginBottom: '0'}}>
>                             <li>By topic: <code>#topic/data/analytics</code></li>
>                             <li>By document type: <code>#type/note</code> or <code>#type/template</code></li>
>                             <li>By status: <code>#status/todo</code> or <code>#status/done</code></li>
>                         </ul>
>                     </div>
>                 </div>
>             ) : (
>                 <p style={{color: 'var(--text-accent)', fontStyle: 'italic'}}>
>                     🎉 Every file is tagged — your vault is well organized!
>                 </p>
>             )}
>         </div>
>     );
> }
> ```

---

## 🔧 Tagging Tools

> [!note]+ 💡 Tagging Conventions
> 
> **Tag naming conventions:**
> - Use a hierarchy: `topic/category/subcategory/concept`
> - Lowercase English, underscores for multi-word: `machine_learning`
> 
> **Common tag templates:**
> - Skills: `topic/skills/data-analysis/fundamentals`
> - Growth: `topic/growth/productivity/time-management`
> - Career: `topic/career/job-search/interview`
> 
> **Quick tagging:**
> 1. Open the command palette with `Ctrl/Cmd + P`
> 2. Search for "Add tag" or use the tag panel
> 3. Use autocomplete to keep tags consistent
