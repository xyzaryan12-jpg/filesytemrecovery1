#include "file_system.h"
#include <stdio.h>
#include <string.h>
#include <time.h>

void init_file_system(FileSystem* fs, size_t total_space) {
    fs->file_count = 0;
    fs->total_space = total_space;
    fs->used_space = 0;
    fs->free_space = total_space;

    memset(fs->files, 0, sizeof(fs->files));

    log_operation("INIT", "File system initialized");
}

int create_file(FileSystem* fs, const char* name, const char* path, size_t size) {
    if (fs->file_count >= MAX_FILES) {
        log_operation("ERROR", "Maximum file limit reached");
        return -1;
    }

    if (fs->free_space < size) {
        log_operation("ERROR", "Insufficient space");
        return -1;
    }

    FileEntry* new_file = &fs->files[fs->file_count];

    strncpy(new_file->name, name, MAX_FILENAME_LENGTH - 1);
    new_file->name[MAX_FILENAME_LENGTH - 1] = '\0';

    strncpy(new_file->path, path, MAX_PATH_LENGTH - 1);
    new_file->path[MAX_PATH_LENGTH - 1] = '\0';

    new_file->size = size;
    new_file->creation_time = time(NULL);
    new_file->modification_time = new_file->creation_time;
    new_file->is_directory = 0;
    new_file->is_deleted = 0;

    fs->file_count++;
    fs->used_space += size;
    fs->free_space = calculate_free_space(fs);

    log_operation("CREATE", name);
    return 0;
}

int delete_file(FileSystem* fs, const char* path) {
    for (int i = 0; i < fs->file_count; i++) {
        if (!fs->files[i].is_deleted && strcmp(fs->files[i].path, path) == 0) {
            fs->files[i].is_deleted = 1;

            fs->used_space -= fs->files[i].size;
            fs->free_space = calculate_free_space(fs);

            log_operation("DELETE", path);
            return 0;
        }
    }

    log_operation("ERROR", "File not found");
    return -1;
}

int recover_file(FileSystem* fs, const char* path) {
    for (int i = 0; i < fs->file_count; i++) {
        if (fs->files[i].is_deleted && strcmp(fs->files[i].path, path) == 0) {
            fs->files[i].is_deleted = 0;

            fs->used_space += fs->files[i].size;
            fs->free_space = calculate_free_space(fs);

            log_operation("RECOVER", path);
            return 0;
        }
    }

    log_operation("ERROR", "File not found for recovery");
    return -1;
}

void list_files(FileSystem* fs, const char* path) {
    printf("Files in %s:\n", path);

    for (int i = 0; i < fs->file_count; i++) {
        if (!fs->files[i].is_deleted) {
            // Show all if path = "/"
            if (strcmp(path, "/") == 0 || strstr(fs->files[i].path, path) == 0) {
                printf("- %s (%zu bytes)\n",
                       fs->files[i].name,
                       fs->files[i].size);
            }
        }
    }
}

void optimize_file_system(FileSystem* fs) {
    defragment_file_system(fs);
    log_operation("OPTIMIZE", "File system optimized");
}

size_t calculate_free_space(FileSystem* fs) {
    return fs->total_space - fs->used_space;
}

void defragment_file_system(FileSystem* fs) {
    // Shift non-deleted entries up
    int write_idx = 0;

    for (int i = 0; i < fs->file_count; i++) {
        if (!fs->files[i].is_deleted) {
            fs->files[write_idx++] = fs->files[i];
        }
    }

    fs->file_count = write_idx;
}

void log_operation(const char* operation, const char* details) {
    FILE* log_file = fopen("logs/activity.log", "a");

    if (log_file) {
        time_t now = time(NULL);
        char* time_str = ctime(&now);
        time_str[strlen(time_str) - 1] = '\0'; // remove newline

        fprintf(log_file, "[%s] %s: %s\n", time_str, operation, details);
        fclose(log_file);
    }
}
