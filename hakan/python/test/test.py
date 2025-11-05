import tkinter as tk

# Ana pencereyi oluştur
root = tk.Tk()
root.title("Hello Tkinter")

# Etiket (Label) oluştur
label = tk.Label(root, text="Hello, World!", font=("Arial", 16))
label.pack(padx=40,pady=40)

# Pencereyi çalıştır
root.mainloop()