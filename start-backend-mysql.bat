@echo off
REM ====================================================================
REM TBA-WAAD System - تشغيل Backend مع MySQL
REM ====================================================================

echo ========================================
echo تشغيل TBA-WAAD Backend مع MySQL
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] التحقق من Maven...
call mvn --version
if errorlevel 1 (
    echo خطأ: Maven غير مثبت!
    echo يرجى تثبيت Maven من: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

echo.
echo [2/3] التحقق من اتصال MySQL...
echo يرجى التأكد من تشغيل MySQL على المنفذ 3306
echo.

echo [3/3] تشغيل Spring Boot مع MySQL Profile...
echo.
call mvn spring-boot:run -Dspring-boot.run.profiles=mysql

if errorlevel 1 (
    echo.
    echo ========================================
    echo فشل تشغيل Backend!
    echo ========================================
    echo.
    echo الأسباب المحتملة:
    echo 1. MySQL غير مشغل
    echo 2. قاعدة البيانات tba_waad_db غير موجودة
    echo 3. خطأ في الاتصال بقاعدة البيانات
    echo 4. كلمة مرور MySQL غير صحيحة
    echo.
    echo راجع الأخطاء أعلاه للتفاصيل
    pause
    exit /b 1
)

pause
