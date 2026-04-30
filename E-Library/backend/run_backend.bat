@echo off
set "JAVA_HOME=C:\Users\user\.jdks\dragonwell-ex-21.0.9"
set "PATH=%JAVA_HOME%\bin;C:\Program Files\apache-maven-3.9.12\bin;%PATH%"
echo Starting Maven compilation and boot...
mvn clean package spring-boot:run -e -DskipTests
