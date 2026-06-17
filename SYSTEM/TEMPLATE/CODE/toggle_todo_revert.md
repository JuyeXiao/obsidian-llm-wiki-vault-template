# **DO NOT DELETE THERE IS A SCRIPT HERE**

```js
// Configuration
const CONFIG = {
    iconPlugin: 'iconic',
    defaultCheckedIcon: 'lucide-check-circle',
    defaultUncheckedIcon: 'lucide-circle',
    statusProperty: 'Status',
    closedProperty: 'closed',
    previousStatusProperty: '_previous_status',
    completedStatus: '4 Completed',
    defaultStatus: '1 To Do',
    projectsFolderPath: 'PARA/PROJECTS/',
    dateFormat: 'YYYY-MM-DD[T]HH:mm'
};

// Helper functions
const isInProjectsFolder = (filePath) => {
    return filePath.startsWith(CONFIG.projectsFolderPath);
};

const getIconPlugin = () => app.plugins.getPlugin(CONFIG.iconPlugin);

const updateFrontmatter = async (file, updateFn) => {
    await app.fileManager.processFrontMatter(file, updateFn);
};

const applyIcon = (filePath, icon) => {
    const iconPlugin = getIconPlugin();
    iconPlugin.saveFileIcon({ id: filePath }, icon, null);
    iconPlugin.refreshIcons();
};

const getCurrentDate = () => {
    return moment().format(CONFIG.dateFormat);
};

// Main function to apply the correct icon based on 'Status'
const applyIconBasedOnStatus = async () => {
    const file = app.workspace.getActiveFile();
    if (!file || !isInProjectsFolder(file.path)) return;

    const fileCache = app.metadataCache.getFileCache(file);
    const fm = fileCache?.frontmatter || {};
    const currentStatus = fm[CONFIG.statusProperty];
    const previousStatus = fm[CONFIG.previousStatusProperty];

    let icon = CONFIG.defaultUncheckedIcon;

    if (currentStatus === CONFIG.completedStatus) {
        icon = CONFIG.defaultCheckedIcon;
        await updateCompletedStatus(file, previousStatus);
    } else {
        await handleNonCompletedStatus(file, currentStatus, previousStatus);
    }

    applyIcon(file.path, icon);
};

const updateCompletedStatus = async (file, previousStatus) => {
    await updateFrontmatter(file, (fm) => {
        if (fm[CONFIG.statusProperty] === CONFIG.completedStatus) {
            fm[CONFIG.closedProperty] = getCurrentDate();
            if (fm[CONFIG.previousStatusProperty] !== CONFIG.completedStatus) {
                fm[CONFIG.previousStatusProperty] = fm[CONFIG.previousStatusProperty] || CONFIG.defaultStatus;
            }
        }
        return fm;
    });
};

const handleNonCompletedStatus = async (file, currentStatus, previousStatus) => {
    await updateFrontmatter(file, (fm) => {
        if (fm.hasOwnProperty(CONFIG.closedProperty)) {
            delete fm[CONFIG.closedProperty];
        }
        if (currentStatus && currentStatus !== CONFIG.completedStatus && currentStatus !== previousStatus) {
            fm[CONFIG.previousStatusProperty] = currentStatus;
        }
        return fm;
    });
};

// Event listeners
const setupEventListeners = () => {
    app.metadataCache.on('changed', (file) => {
        if (file.path === app.workspace.getActiveFile()?.path) {
            applyIconBasedOnStatus();
        }
    });

    app.workspace.on('file-open', applyIconBasedOnStatus);
};

// Initialize project management
const initializeProjectManagement = () => {
    setupEventListeners();
    applyIconBasedOnStatus();
};

// Run the initialization
initializeProjectManagement();
```
