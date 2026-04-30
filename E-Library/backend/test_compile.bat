@echo off
set "JAVA_HOME=C:\jdk-21"
if not exist "%JAVA_HOME%\bin\java.exe" set "JAVA_HOME=C:\Users\user\Downloads\PRGRAM_File\jdk-21_windows-x64_bin\jdk-21.0.9"
set "PATH=%JAVA_HOME%\bin;C:\apache-maven-3.9.6\bin;%PATH%"
mvn clean compile -e -DskipTests
