import os
import shutil

def move_file_by_types(source,destination,types,name):
    for i in name:
        try:
            path = os.path.join(destination,i)
            if not os.path.exists(path): 
                os.makedirs(path)
        except Exception as e:
            print(f"Error creating directory: {e}")
            pass

    file_map =  dict(zip(types,name))
    print(file_map)
    print (file_map.items())
    print(file_map.values())
    print(file_map.keys())
    for file in os.listdir(source):
        for type,name in file_map.items():
            try:
                if file.endswith(type):
                    shutil.move(os.path.join(source,file),os.path.join(destination,name,file))
            except Exception as e:
                print(f"Error moving file: {e}")
                pass                               # pass is used to skip the error and continue the loop

    

source='/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/try'
destination='/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/multilple_file/'
type= ['.txt','.jpg','.py','.yaml']
name=['text','jpg','py','yaml']
move_file_by_types(source,destination,type,name)
