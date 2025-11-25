from tkinter import *
import pyqrcode
import os

root = Tk()
root.title("QR Code Generator")
root.geometry("500x550")

def create_qr_code():
    qr_data = my_entry.get()
    qr_code = pyqrcode.create(qr_data)
    file_path = os.path.join(os.getcwd(), "qrcode.png")
    base_name, extension = os.path.splitext(file_path)
    counter = 1
    while os.path.exists(file_path):
        file_path = f"{base_name}_{counter}{extension}"
        counter += 1
    qr_code.png(file_path, scale=8)
    info_label.config(text=f"QR Code saved as {os.path.basename(file_path)}")
    image = PhotoImage(file=file_path)
    my_label.config(image=image)
    my_label.image = image

def clear_all():
    my_entry.delete(0, END)
    my_label.config(text="", image="")
    info_label.config(text="")

my_entry = Entry(root, font=("Heltevica 14"), width=24,justify=CENTER,)
my_entry.pack(pady=20)

create_button = Button(root, text="Create QR Code" , command=create_qr_code)
create_button.pack(pady=20)

clear_button = Button(root, text="Clear" , command=clear_all)
clear_button.pack()

my_label = Label(root, text="")
my_label.pack(pady=20)

info_label = Label(root, text="")
info_label.pack(pady=20)

root.mainloop()