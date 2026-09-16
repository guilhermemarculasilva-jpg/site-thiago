@echo off
chcp 65001 >nul
title Revisao de layout - 5 correcoes

echo ============================================================
echo   REVISAO DE LAYOUT
echo   header no tablet, selo EXPLORE, dobra, contraste e acesso
echo ============================================================
echo.

if not exist ".git" (
  echo [ERRO] Coloque este arquivo DENTRO da pasta do projeto:
  echo        C:\curso git\site thiago
  echo.
  pause
  exit /b 1
)

echo [1/3] Copiando os arquivos corrigidos...
xcopy /e /i /y /q "correcoes6\app"        "app"        >nul
xcopy /e /i /y /q "correcoes6\components" "components" >nul
if errorlevel 1 (
  echo [ERRO] A pasta "correcoes6" nao esta aqui do lado.
  pause
  exit /b 1
)
echo       pronto.
echo.

echo [2/3] Baixando o que o painel salvou no GitHub...
echo.
git pull --no-rebase --no-edit
if errorlevel 1 (
  echo.
  echo [PAROU] Copie o texto acima e mande para o assistente.
  pause
  exit /b 1
)
echo.

echo [3/3] Enviando...
echo.
git add -A
git commit -m "revisao de layout: tablet, dobra, contraste e acessibilidade"
git push
if errorlevel 1 (
  echo.
  echo [PAROU] Copie o texto acima e mande para o assistente.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo   ENVIADO
echo ============================================================
echo.
echo A Vercel publica em 1 a 2 minutos.
echo Depois abra o site e aperte Ctrl+Shift+R.
echo.
pause
