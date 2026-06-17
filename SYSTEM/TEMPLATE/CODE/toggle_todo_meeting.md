# **DO NOT DELETE THERE IS A SCRIPT HERE**

```js
// Configuration for Meeting Management
const MEETING_CONFIG = {
    iconPlugin: 'iconic',
    defaultCheckedIcon: 'lucide-check-circle',
    defaultUncheckedIcon: 'lucide-circle',
    meetingStatusProperty: 'meeting_status',
    closedProperty: 'closed',
    meetingsFolderPath: 'PARA/RESOURCES/MEETINGS/',
    dateFormat: 'YYYY-MM-DD[T]HH:mm'
};

// Helper functions
const isInMeetingsFolder = (filePath) => {
    return filePath.startsWith(MEETING_CONFIG.meetingsFolderPath);
};

const getMeetingIconPlugin = () => app.plugins.getPlugin(MEETING_CONFIG.iconPlugin);

const updateMeetingFrontmatter = async (file, updateFn) => {
    await app.fileManager.processFrontMatter(file, updateFn);
};

const applyMeetingIcon = (filePath, icon) => {
    const iconPlugin = getMeetingIconPlugin();
    if (iconPlugin) {
        iconPlugin.saveFileIcon({ id: filePath }, icon, null);
        iconPlugin.refreshIcons();
    }
};

const getCurrentDate = () => {
    return moment().format(MEETING_CONFIG.dateFormat);
};

// Main function to apply the correct icon based on 'meeting_status'
const applyMeetingIconBasedOnStatus = async () => {
    const file = app.workspace.getActiveFile();
    if (!file || !isInMeetingsFolder(file.path)) return;

    const fileCache = app.metadataCache.getFileCache(file);
    const fm = fileCache?.frontmatter || {};
    const meetingStatus = fm[MEETING_CONFIG.meetingStatusProperty];

    let icon = MEETING_CONFIG.defaultUncheckedIcon;

    if (meetingStatus === true) {
        icon = MEETING_CONFIG.defaultCheckedIcon;
        await updateMeetingCompleted(file);
    } else {
        await handleUncompletedMeeting(file);
    }

    applyMeetingIcon(file.path, icon);
};

const updateMeetingCompleted = async (file) => {
    await updateMeetingFrontmatter(file, (fm) => {
        fm[MEETING_CONFIG.closedProperty] = getCurrentDate();
        return fm;
    });
};

const handleUncompletedMeeting = async (file) => {
    await updateMeetingFrontmatter(file, (fm) => {
        if (fm.hasOwnProperty(MEETING_CONFIG.closedProperty)) {
            delete fm[MEETING_CONFIG.closedProperty];
        }
        return fm;
    });
};

// Event listeners for meetings
const setupMeetingEventListeners = () => {
    app.metadataCache.on('changed', (file) => {
        if (file.path === app.workspace.getActiveFile()?.path) {
            applyMeetingIconBasedOnStatus();
        }
    });

    app.workspace.on('file-open', applyMeetingIconBasedOnStatus);
};

// Initialize meeting management
const initializeMeetingManagement = () => {
    setupMeetingEventListeners();
    applyMeetingIconBasedOnStatus();
};

// Run the initialization
initializeMeetingManagement();
```
