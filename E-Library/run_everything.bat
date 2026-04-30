@echo off
cd /d "C:\Users\user\OneDrive - Sri Lanka Institute of Information Technology\Documents\AI\E-Library\backend"
set "JAVA_HOME=C:\Users\user\Downloads\PRGRAM_File\jdk-21_windows-x64_bin\jdk-21.0.9"
set "PATH=%JAVA_HOME%\bin;C:\Program Files\apache-maven-3.9.12\bin;%PATH%"
call mvn clean package -DskipTests
cd target
"%JAVA_HOME%\bin\java.exe" -jar elibrary-backend-1.0.0.jar
