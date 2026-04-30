@echo off
REM Maven setup and build script
REM Download Maven if not exists
if not exist "C:\apache-maven-3.9.6\bin\mvn.cmd" (
    echo Downloading Maven...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$progressPreference='SilentlyContinue';$url='https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip';$out='C:\maven.zip';Invoke-WebRequest -Uri $url -OutFile $out;Expand-Archive $out -DestinationPath 'C:\' -Force;Remove-Item $out"
)

REM Set PATH
set PATH=C:\apache-maven-3.9.6\bin;%PATH%

REM Change to backend directory and build
cd /d "C:\Users\user\OneDrive - Sri Lanka Institute of Information Technology\Documents\AI\E-Library\backend"
mvn clean install -DskipTests

pause
