@echo off
cls
color 0A
echo =======================================================================
echo          PUSHING INDIAN RAILWAYS PROJECT TO GITHUB
echo =======================================================================
echo.
echo Target Repository: https://github.com/tirtheshbari18/Indian-Railways-Train-Tracking-Website.git
echo.
echo A GitHub authentication window may open in your default browser.
echo Please click "Authorize GitCredentialManager" if prompted.
echo.
cd /d "%~dp0"
echo 1/2 Pushing 'main' branch...
git push -u origin main
echo.
echo 2/2 Pushing 'master' branch...
git push -u origin master
echo.
echo =======================================================================
echo DONE! Return to Vercel and click Deploy.
echo =======================================================================
pause
