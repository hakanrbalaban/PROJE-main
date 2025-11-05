import tkinter as tk

root = tk.Tk()
root.title("hello world")

label = tk.Label(root, text= "Hello", font=("Arial", 16))
label.pack(padx=40, pady=40)

root.mainloop()