# you need email address and you should have app-password
#email : eng19ct0010.dharshank@gmail.com
#apppassword: lfyu bpxb zehy splk

from email.message import EmailMessage
import smtplib
import os

def send_email(Sender,password,Receiver,name,Subject,body,file_name):
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com',465) as smtp:
            smtp.login(Sender,password)
            for i,j in zip(Receiver,name):
                body = body.format(name=j)
                msg = EmailMessage()
                msg['From'] = Sender
                msg['To'] = i
                msg['Subject'] = Subject
                msg.set_content(body)
                file_base_name = os.path.basename(file_name)
                msg.add_attachment(open(file_name,'rb').read(),maintype='application',subtype='octet-stream',filename=file_base_name)
                smtp.send_message(msg)
                print(f"email sent to {i}")
    except Exception as e:
        print(f"Error sending email: {e}")
                

Sender = "eng19ct0010.dharshank@gmail.com"
password = "lfyu bpxb zehy splk"
Receiver = ["eng19ct0010.dharshank@gmail.com","dharshan122001@gmail.com"]
file_name = "/mnt/data1Tb/workspace/dharshan/virtual-herbal-garden/python_automation/webscraping.py"
name = []
for i in Receiver:
    name.append(i.split("@")[0].capitalize())
Subject = "Test Email"
body = """ 
hello {name},
this is a test email sent from python.
"""



send_email(Sender,password,Receiver,name,Subject,body,file_name)