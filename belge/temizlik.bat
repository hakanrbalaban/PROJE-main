@echo off
echo Temp klasörü temizleniyor...
del /q /s "%temp%\*.*"

echo Windows Temp temizleniyor...
del /q /s "C:\Windows\Temp\*.*"

echo Prefetch temizleniyor...
del /q /s "C:\Windows\Prefetch\*.*"

echo Temizlik tamamlandı!
exit
