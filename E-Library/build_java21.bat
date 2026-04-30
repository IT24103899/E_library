@echo off
REM Maven setup and build script with Java 21
REM Check for Java 21
for /f "tokens=* USEBACKQ" %%F in (`java -version 2^>^&1`) do (
    set "javaversion=%%F"
)
echo Current Java: %javaversion%

REM Try to download Java 21 if not present
if not exist "C:\jdk-21" (
    echo Downloading Java 21...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$progressPreference='SilentlyContinue';$url='https://download.oracle.com/java/21/latest/jdk-21_windows-x64_bin.zip';$out='C:\jdk21.zip';try{Invoke-WebRequest -Uri $url -OutFile $out -ErrorAction Stop;Expand-Archive $out -DestinationPath 'C:\' -Force;Rename-Item 'C:\jdk-*' 'C:\jdk-21' -Force;Remove-Item $out}catch{Write-Host 'Could not download Java 21'}"
)

REM Set JAVA_HOME
if exist "C:\jdk-21\bin\java.exe" (
    set "JAVA_HOME=C:\jdk-21"
    set "PATH=C:\jdk-21\bin;%PATH%"
    echo JAVA_HOME set to: %JAVA_HOME%
)

REM Verify Java version
java -version

REM Maven setup
if not exist "C:\apache-maven-3.9.6\bin\mvn.cmd" (
    echo Downloading Maven...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$progressPreference='SilentlyContinue';$url='https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip';$out='C:\maven.zip';try{Invoke-WebRequest -Uri $url -OutFile $out -ErrorAction Stop;Expand-Archive $out -DestinationPath 'C:\' -Force;Remove-Item $out}catch{Write-Host 'Could not download Maven'}"
)

REM Set Maven PATH
set PATH=C:\apache-maven-3.9.6\bin;%PATH%

REM Change to backend directory and build
cd /d "C:\Users\user\OneDrive - Sri Lanka Institute of Information Technology\Documents\AI\E-Library\backend"
echo Building with Maven...
mvn clean install -DskipTests

pause
