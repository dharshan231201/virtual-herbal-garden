import os
import shutil
from datetime import datetime

def backup_zip(source,destination):
    timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    backup_filename = f"backup_{timestamp}"
    backup_path = os.path.join(destination,backup_filename)
    print(backup_path)
    try:
        os.makedirs(destination,exist_ok=True)
        shutil.make_archive(backup_path, 'zip', source)
        print(f"Backup created: {backup_path}")
    except Exception as e:
        print(f"Error creating directory: {e}")
        pass
    
source='/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/multilple_file/text'
destination='/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/multilple_file/ztxt'
backup_zip(source,destination)