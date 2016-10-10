"E:\TestCoverage\Testing\packages\OpenCover.4.6.519\tools\OpenCover.Console.exe" ^
-target:"C:\Program Files\Microsoft Visual Studio 12.0\Common7\IDE\MSTest.exe" ^
-targetargs:"/testcontainer:E:\TestCoverage\Testing\UnitTestProject1\bin\Debug\UnitTestProject1.dll /resultsfile:\"D:\Result\testResultNew.trx\"" ^
-filter:"+[*]* ^
-output:"D:\Result\Report.xml"
"E:\TestCoverage\Testing\packages\ReportGenerator.2.4.5.0\tools\ReportGenerator.exe" ^
-reports:"D:\Result\Report.xml" ^
-targetdir:"D:\Result\ReportOutput" 