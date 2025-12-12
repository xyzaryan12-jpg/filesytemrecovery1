document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const createFileBtn = document.getElementById('createFile');
    const deleteFileBtn = document.getElementById('deleteFile');
    const recoverFileBtn = document.getElementById('recoverFile');
    const optimizeFsBtn = document.getElementById('optimizeFs');
    const refreshViewBtn = document.getElementById('refreshView');
    const filePathInput = document.getElementById('filePath');
    const directoryContents = document.getElementById('directoryContents');
    const deletedFiles = document.getElementById('deletedFiles');
    const logPanel = document.getElementById('logPanel');
    const totalSpace = document.getElementById('totalSpace');
    const usedSpace = document.getElementById('usedSpace');
    const freeSpace = document.getElementById('freeSpace');

    // File system state
    let fileSystem = {
        files: [],
        deletedFiles: [],
        totalSpace: 1024 * 1024 * 1024, // 1GB
        usedSpace: 0
    };

    // Initialize event listeners
    createFileBtn.addEventListener('click', createFile);
    deleteFileBtn.addEventListener('click', deleteFile);
    recoverFileBtn.addEventListener('click', recoverFile);
    optimizeFsBtn.addEventListener('click', optimizeFileSystem);
    refreshViewBtn.addEventListener('click', refreshView);

    // Create multiple files
    function createFile() {
        const path = filePathInput.value.trim();
        if (!path) {
            addLog('Please enter a file path', 'error');
            return;
        }

        // Check if path contains wildcard for multiple files
        if (path.includes('*')) {
            createMultipleFiles(path);
        } else {
            createSingleFile(path);
        }
    }

    // Create a single file
    function createSingleFile(path) {
        const fileSize = Math.floor(Math.random() * 1024 * 1024) + 1024; // Random size between 1KB and 1MB
        fileSystem.files.push({
            path: path,
            size: fileSize,
            created: new Date()
        });
        fileSystem.usedSpace += fileSize;

        updateUI();
        addLog(`Created file: ${path} (${formatSize(fileSize)})`, 'success');
    }

    // Create multiple files based on pattern
    function createMultipleFiles(pattern) {
        const basePath = pattern.substring(0, pattern.lastIndexOf('/') + 1);
        const fileNamePattern = pattern.substring(pattern.lastIndexOf('/') + 1);
        const count = parseInt(prompt('How many files would you like to create?', '5')) || 5;

        for (let i = 1; i <= count; i++) {
            const fileName = fileNamePattern.replace('*', `file${i}`);
            const fullPath = basePath + fileName;
            createSingleFile(fullPath);
        }
    }

    // Delete multiple files
    function deleteFile() {
        const path = filePathInput.value.trim();
        if (!path) {
            addLog('Please enter a file path', 'error');
            return;
        }

        if (path.includes('*')) {
            deleteMultipleFiles(path);
        } else {
            deleteSingleFile(path);
        }
    }

    // Delete a single file
    function deleteSingleFile(path) {
        const fileIndex = fileSystem.files.findIndex(f => f.path === path);
        if (fileIndex === -1) {
            addLog('File not found', 'error');
            return;
        }

        const file = fileSystem.files[fileIndex];
        fileSystem.files.splice(fileIndex, 1);
        fileSystem.deletedFiles.push({
            ...file,
            deleted: new Date()
        });
        fileSystem.usedSpace -= file.size;

        updateUI();
        addLog(`Deleted file: ${path}`, 'warning');
    }

    // Delete multiple files based on pattern
    function deleteMultipleFiles(pattern) {
        const basePath = pattern.substring(0, pattern.lastIndexOf('/') + 1);
        const fileNamePattern = pattern.substring(pattern.lastIndexOf('/') + 1);
        const regex = new RegExp('^' + fileNamePattern.replace('*', '.*') + '$');

        const filesToDelete = fileSystem.files.filter(f => 
            f.path.startsWith(basePath) && regex.test(f.path.substring(basePath.length))
        );

        if (filesToDelete.length === 0) {
            addLog('No files found matching the pattern', 'error');
            return;
        }

        filesToDelete.forEach(file => {
            deleteSingleFile(file.path);
        });
    }

    // Recover multiple files
    function recoverFile() {
        const path = filePathInput.value.trim();
        if (!path) {
            addLog('Please enter a file path', 'error');
            return;
        }

        if (path.includes('*')) {
            recoverMultipleFiles(path);
        } else {
            recoverSingleFile(path);
        }
    }

    // Recover a single file
    function recoverSingleFile(path) {
        const fileIndex = fileSystem.deletedFiles.findIndex(f => f.path === path);
        if (fileIndex === -1) {
            addLog('Deleted file not found', 'error');
            return;
        }

        const file = fileSystem.deletedFiles[fileIndex];
        fileSystem.deletedFiles.splice(fileIndex, 1);
        fileSystem.files.push({
            path: file.path,
            size: file.size,
            created: file.created
        });
        fileSystem.usedSpace += file.size;

        updateUI();
        addLog(`Recovered file: ${path}`, 'success');
    }

    // Recover multiple files based on pattern
    function recoverMultipleFiles(pattern) {
        const basePath = pattern.substring(0, pattern.lastIndexOf('/') + 1);
        const fileNamePattern = pattern.substring(pattern.lastIndexOf('/') + 1);
        const regex = new RegExp('^' + fileNamePattern.replace('*', '.*') + '$');

        const filesToRecover = fileSystem.deletedFiles.filter(f => 
            f.path.startsWith(basePath) && regex.test(f.path.substring(basePath.length))
        );

        if (filesToRecover.length === 0) {
            addLog('No deleted files found matching the pattern', 'error');
            return;
        }

        filesToRecover.forEach(file => {
            recoverSingleFile(file.path);
        });
    }

    // Optimize file system
    function optimizeFileSystem() {
        // Simulate optimization
        const oldUsedSpace = fileSystem.usedSpace;
        fileSystem.usedSpace = Math.floor(fileSystem.usedSpace * 0.95); // 5% space savings
        const savedSpace = oldUsedSpace - fileSystem.usedSpace;

        updateUI();
        addLog(`File system optimized. Saved ${formatSize(savedSpace)}`, 'success');
    }

    // Refresh the view
    function refreshView() {
        updateUI();
        addLog('View refreshed', 'info');
    }

    // Update the UI
    function updateUI() {
        // Update space indicators
        totalSpace.textContent = formatSize(fileSystem.totalSpace);
        usedSpace.textContent = formatSize(fileSystem.usedSpace);
        freeSpace.textContent = formatSize(fileSystem.totalSpace - fileSystem.usedSpace);

        // Update directory contents
        directoryContents.innerHTML = '';
        fileSystem.files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'directory-item';
            item.innerHTML = `
                <i class="fas fa-file text-blue-500"></i>
                <span>${file.path}</span>
                <span class="text-gray-500 ml-auto">${formatSize(file.size)}</span>
            `;
            directoryContents.appendChild(item);
        });

        // Update deleted files
        deletedFiles.innerHTML = '';
        if (fileSystem.deletedFiles.length === 0) {
            deletedFiles.innerHTML = '<p class="text-gray-500">No deleted files found</p>';
        } else {
            fileSystem.deletedFiles.forEach(file => {
                const item = document.createElement('div');
                item.className = 'deleted-file-item';
                item.innerHTML = `
                    <span>${file.path}</span>
                    <span class="text-gray-500">${formatSize(file.size)}</span>
                `;
                deletedFiles.appendChild(item);
            });
        }
    }

    // Add log entry
    function addLog(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logPanel.appendChild(logEntry);
        logPanel.scrollTop = logPanel.scrollHeight;
    }

    // Format file size
    function formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    // Initial UI update
    updateUI();
    addLog('File system initialized', 'info');
}); 