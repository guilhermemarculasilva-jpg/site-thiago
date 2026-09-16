@echo off
chcp 65001 >nul
title Corrige abertura da pagina e capa do imovel

echo ============================================================
echo   PAGINA ABRE NO TOPO + CAPA NITIDA
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
xcopy /e /i /y /q "correcoes5\app"        "app"        >nul
xcopy /e /i /y /q "correcoes5\components" "components" >nul
if errorlevel 1 (
  echo [ERRO] A pasta "correcoes5" nao esta aqui do lado.
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
git commit -m "pagina do imovel abre no topo e capa nitida"
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
echo Depois abra a pagina do imovel e aperte Ctrl+Shift+R.
echo.
pause
