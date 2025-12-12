#include "backend/recovery.h"
#include <stdio.h>
#include <stdlib.h>

int main() {
    FileSystem fs;
    init_file_system(&fs, 1024 * 1024 * 1024); // 1GB total space

    // Example usage
    create_file(&fs, "test1.txt", "/documents", 1024);
    create_file(&fs, "test2.txt", "/documents", 2048);
    create_file(&fs, "test3.txt", "/downloads", 4096);

    printf("Initial file system state:\n");
    list_files(&fs, "/");

    // Delete a file
    delete_file(&fs, "/documents/test1.txt");

    printf("\nAfter deletion:\n");
    list_files(&fs, "/");

    // Scan for deleted files
    scan_for_deleted_files(&fs);

    // Recover deleted files
    recover_file(&fs, "/documents/test1.txt");

    printf("\nAfter recovery:\n");
    list_files(&fs, "/");

    // Analyze file system
    analyze_file_system(&fs);

    // Optimize file system
    optimize_file_system_advanced(&fs);

    printf("\nFinal file system state:\n");
    list_files(&fs, "/");

    return 0;
}
