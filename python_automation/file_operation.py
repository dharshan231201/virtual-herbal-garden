def file_operation(file_name,keys,values):
    lines_updated=[]
    datas = dict(zip(keys,values))
    with open(file_name,'r') as file:
        lines = file.readlines()

    for line in lines:
        for key,value in datas.items():
            if key in line:
                lines_updated.append(f"{key}={value}\n")
                break
        else:
            lines_updated.append(line)

    with open(file_name,'w') as file:
        file.writelines(lines_updated)

file_name="/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/python_automation/server.conf"
key=['name','age']
value=['harshan','22']
file_operation(file_name,key,value)

