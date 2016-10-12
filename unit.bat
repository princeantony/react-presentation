"%~dp0\packages\OpenCover.4.6.519\tools\OpenCover.Console.exe" ^
-register:user ^
-target:"%VS120COMNTOOLS%\..\IDE\mstest.exe" ^
-targetargs:"/testcontainer:\"%~dp0\UnitTestProject1\bin\Debug\UnitTestProject1.dll\" /resultsfile:\"%~dp0UnitTestProject1.trx\" " ^
-output:"%~dp0\GeneratedReports\UnitTestProject1.xml"

"%~dp0\packages\ReportGenerator.2.4.5.0\tools\ReportGenerator.exe" ^
-reports:"%~dp0\GeneratedReports\UnitTestProject1.xml" ^
-targetdir:"%~dp0\GeneratedReports\ReportGenerator"

@echo off
pause
