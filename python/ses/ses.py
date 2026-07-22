import sys
import time
import webbrowser
import pyautogui
import sounddevice as sd
import soundfile as sf
import speech_recognition as sr
import subprocess

platform = sys.argv[1] if len(sys.argv) > 1 else "youtube"

fs = 44100
filename = "temp_audio.wav"

r = sr.Recognizer()

print("Sesli asistan aktif ve kararlı modda...")

while True:
  try:
    audio_data = sd.rec(int(4 * fs), samplerate=fs, channels=1, dtype='int16')
    sd.wait()
    sf.write(filename, audio_data, fs)

    with sr.AudioFile(filename) as source:
      audio = r.record(source)

    komut = r.recognize_google(audio, language='tr-TR').lower()

    if "bilgisayar kapat" in komut or komut == "kapat":
      print("Chrome kapatılıyor...")
      subprocess.run(["powershell", "-Command", "Stop-Process -Name chrome -ErrorAction SilentlyContinue"], capture_output=True)
      continue

    if "bilgisayar" in komut:
      sarki_temiz = komut.replace("bilgisayar", "").replace("youtube", "").strip()

      if sarki_temiz == "" or sarki_temiz == "kapat":
        if sarki_temiz == "kapat":
          subprocess.run(["powershell", "-Command", "Stop-Process -Name chrome -ErrorAction SilentlyContinue"], capture_output=True)
        continue

      print(f"Aratılan: {sarki_temiz}")

      if platform == "youtubemusic":
        url = f"https://music.youtube.com/search?q={sarki_temiz}"
      elif platform == "dailymotion":
        url = f"https://www.dailymotion.com/search/{sarki_temiz}"
      else:
        url = f"https://www.youtube.com/results?search_query={sarki_temiz}&sp=EgIQAQ%253D%253D"

      webbrowser.open(url)
      
      # Bildirim zilini atlayıp doğrudan ilk videoya odaklanmak için tab sayısını 3 yaptık
      time.sleep(3.5)
      pyautogui.press('tab', presses=3, interval=0.1)
      pyautogui.press('enter')

  except:
    time.sleep(0.1)