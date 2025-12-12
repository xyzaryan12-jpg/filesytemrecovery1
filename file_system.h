#ifndef FILE_SYSTEM_H
#define FILE_SYSTEM_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define MAX_FILENAME_LENGTH 256
#define MAX_PATH_LENGTH 1024
#define MAX_FILES 1000
#define BLOCK_SIZE 4096

typedef struct {
    char name[MAX_FILENAME_LENGTH];
    size_t size;
    time_t creation_time;
    time_t modification_time;
    int is_directory;
    int is_deleted;
    char path[MAX_PATH_LENGTH];
} FileEntry;

typedef struct {
    FileEntry files[MAX_FILES];
    int file_count;
    size_t total_space;
    size_t used_space;
    size_t free_space;
} FileSystem;

// File System Operations
void init_file_system(FileSystem* fs, size_t total_space);
int create_file(FileSystem* fs, const char* name, const char* path, size_t size);
int delete_file(FileSystem* fs, const char* path);
int recover_file(FileSystem* fs, const char* path);
void list_files(FileSystem* fs, const char* path);
void optimize_file_system(FileSystem* fs);

// Utility Functions
size_t calculate_free_space(FileSystem* fs);
void defragment_file_system(FileSystem* fs);
void log_operation(const char* operation, const char* details);

#endif // FILE_SYSTEM_H 