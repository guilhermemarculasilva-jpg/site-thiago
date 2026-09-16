@echo off
chcp 65001 >nul
title Novo logo e cabecalho preto

echo ============================================================
echo   NOVO LOGO + FAVICON + CABECALHO PRETO
echo ============================================================
echo.

if not exist ".git" (
  echo [ERRO] Coloque este arquivo DENTRO da pasta do projeto:
  echo        C:\curso git\site thiago
  echo.
  pause
  exit /b 1
)

echo [1/4] Copiando o novo logo e os icones...
xcopy /e /i /y /q "correcoes2\app"    "app"    >nul
xcopy /e /i /y /q "correcoes2\public" "public" >nul
if errorlevel 1 (
  echo [ERRO] A pasta "correcoes2" nao foi encontrada aqui do lado.
  pause
  exit /b 1
)
echo       pronto.
echo.

echo [2/4] Removendo o lixo da instalacao anterior...
if exist "correcoes"   rmdir /s /q "correcoes"
if exist "APLICAR.bat" del /q "APLICAR.bat"
echo       pronto.
echo.

echo [3/4] Baixando o que o painel salvou no GitHub...
echo.
git pull --no-rebase --no-edit
if errorlevel 1 (
  echo.
  echo [PAROU] Copie o texto acima e mande para o assistente.
  pause
  exit /b 1
)
echo.

echo [4/4] Enviando...
echo.
git add -A
git commit -m "novo logo, favicon e cabecalho com fundo preto"
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
echo.
echo O icone da aba pode demorar a trocar - o navegador guarda
echo o antigo. Use Ctrl+Shift+R para forcar a atualizacao.
echo.
pause
