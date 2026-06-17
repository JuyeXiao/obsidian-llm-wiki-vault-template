# toggle_todo

<%*
const CONFIG = {
    iconPlugin: 'iconic',
    defaultCheckedIcon: 'lucide-check-circle',
    defaultUncheckedIcon: 'lucide-circle',
    dateFormat: 'YYYY-MM-DD[T]HH:mm',
    statusProperty: 'Status',
    closedProperty: 'closed',
    previousStatusProperty: '_previous_status',
    completedStatus: '4 Completed',
    defaultStatus: '1 To Do',
    file_state: 'file_state',
    file_state_value: 'unchecked_task',
    scheduledDateProperty: 'scheduled_date',
    meetingStatusProperty: 'meeting_status'
};

// Helper functions
const getCurrentDate = () => tp.date.now(CONFIG.dateFormat);

const getIconPlugin = () => {
    const plugin = app.plugins.getPlugin(CONFIG.iconPlugin);
    if (!plugin) {
        console.error(`Icon plugin "${CONFIG.iconPlugin}" not found.`);
    }
    return plugin;
};

const updateFrontmatter = async (file, updateFn) => {
    try {
        await app.fileManager.processFrontMatter(file, updateFn);
    } catch (error) {
        console.error('Error updating frontmatter:', error);
    }
};

const applyIcon = (file, icon) => {
    const iconPlugin = getIconPlugin();
    if (iconPlugin) {
        iconPlugin.saveFileIcon({ id: file.path }, icon, null);
        iconPlugin.refreshIcons();
    }
};

const removeIcon = (file) => {
    const iconPlugin = getIconPlugin();
    if (iconPlugin) {
        iconPlugin.saveFileIcon({ id: file.path }, null, null);
        iconPlugin.refreshIcons();
    }
};

// Workflow functions
const handleStatusProperty = (frontmatter) => {
    if (frontmatter.hasOwnProperty(CONFIG.statusProperty)) {
        const statusValue = frontmatter[CONFIG.statusProperty];
        const previousStatus = frontmatter[CONFIG.previousStatusProperty];

        if (statusValue === CONFIG.completedStatus) {
            return {
                icon: CONFIG.defaultUncheckedIcon,
                updates: {
                    [CONFIG.closedProperty]: undefined,
                    [CONFIG.statusProperty]: previousStatus && previousStatus !== CONFIG.completedStatus
                        ? previousStatus
                        : CONFIG.defaultStatus
                }
            };
        } else {
            return {
                icon: CONFIG.defaultCheckedIcon,
                updates: {
                    [CONFIG.statusProperty]: CONFIG.completedStatus,
                    [CONFIG.closedProperty]: getCurrentDate()
                }
            };
        }
    }
    return null;
};

const handleMeetingStatus = (frontmatter) => {
    if (frontmatter.hasOwnProperty(CONFIG.scheduledDateProperty) &&
        frontmatter.hasOwnProperty(CONFIG.meetingStatusProperty)) {

        const currentMeetingStatus = frontmatter[CONFIG.meetingStatusProperty];
        
        if (currentMeetingStatus === false) {
            return {
                icon: CONFIG.defaultCheckedIcon,
                updates: {
                    [CONFIG.meetingStatusProperty]: true,
                    [CONFIG.closedProperty]: getCurrentDate()
                }
            };
        } else if (currentMeetingStatus === true) {
            return {
                icon: CONFIG.defaultUncheckedIcon,
                updates: {
                    [CONFIG.meetingStatusProperty]: false,
                    [CONFIG.closedProperty]: undefined
                }
            };
        }
    }
    return null;
};

const handleDefaultWorkflow = (frontmatter) => {
    if (frontmatter.hasOwnProperty(CONFIG.closedProperty)) {
        return {
            icon: null,
            updates: {
                [CONFIG.closedProperty]: undefined
            },
            removeIcon: true
        };
    } else if (!frontmatter.hasOwnProperty(CONFIG.file_state) ||
               frontmatter[CONFIG.file_state] !== CONFIG.file_state_value) {
        return {
            icon: CONFIG.defaultUncheckedIcon,
            updates: {
                [CONFIG.file_state]: CONFIG.file_state_value
            }
        };
    } else if (frontmatter[CONFIG.file_state] === CONFIG.file_state_value) {
        return {
            icon: CONFIG.defaultCheckedIcon,
            updates: {
                [CONFIG.closedProperty]: getCurrentDate(),
                [CONFIG.file_state]: undefined
            }
        };
    }
    return null;
};

// Main logic
tp.hooks.on_all_templates_executed(async () => {
    const file = tp.file.find_tfile(tp.file.path(true));
    if (!file) {
        console.error('No active file found.');
        return;
    }

    let result = null;

    await updateFrontmatter(file, (frontmatter) => {
        // Order of workflow checks
        const workflows = [
            handleStatusProperty,
            handleMeetingStatus,
            handleDefaultWorkflow
        ];

        for (const workflow of workflows) {
            result = workflow(frontmatter);
            if (result) break;
        }

        if (result) {
            Object.entries(result.updates).forEach(([key, value]) => {
                if (value === undefined) {
                    delete frontmatter[key];
                } else {
                    frontmatter[key] = value;
                }
            });
        }

        return frontmatter;
    });

    if (result) {
        if (result.removeIcon) {
            removeIcon(file);
        } else if (result.icon) {
            applyIcon(file, result.icon);
        }
    }
});
%>
