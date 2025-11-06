# move the 30 days older file to other directory and make it a zip file and delete it

import os
import time
import shutil


def delete_file(destination,days,copy_destination):
    timestamp = time.time() - days*24*60*60
    for root,dirs,files in os.walk(destination):
        for file in files:
            file_path = os.path.join(root,file)
            mod_time = os.path.getmtime(file_path)
            if mod_time < timestamp:
                try:
                    new_filename = file_path.replace(os.sep, '_').lstrip('_')
                    dest_filename = os.path.join(copy_destination,new_filename)
                    shutil.copy2(file_path,dest_filename)
                    os.remove(file_path)
                    print(f"Deleted file: {file_path}")
                except Exception as e:
                    print(f"Error copying file: {e}")
                    pass
    archive_path = shutil.make_archive(f'{copy_destination}/backup', 'zip', copy_destination)
    shutil.copy2(archive_path, destination)
    shutil.rmtree(copy_destination)
    print(f"Archive created: {archive_path}")
                    


destination='/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/multilple_file'
copy_destination='/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/try'
delete_file(destination,30,copy_destination)
