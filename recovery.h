#ifndef RECOVERY_H
#define RECOVERY_H

#include "file_system.h"

void scan_for_deleted_files(FileSystem* fs);
int recover_all_deleted_files(FileSystem* fs);
void analyze_file_system(FileSystem* fs);
void optimize_file_system_advanced(FileSystem* fs);

#endif // RECOVERY_H 