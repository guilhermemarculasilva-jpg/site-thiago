@echo off
chcp 65001 >nul
setlocal

echo ============================================================
echo   CORRECOES DE LAYOUT - Thiago Bostock Imoveis
echo ============================================================
echo.
echo Este script move as paginas do site para a pasta (site).
echo Isso impede que o cabecalho dourado apareca dentro do painel.
echo.
echo As URLs do site NAO mudam.
echo.

if not exist "app\layout.tsx" (
  echo [ERRO] Rode este arquivo DENTRO da pasta do projeto.
  echo        Ex: C:\curso git\site thiago
  echo.
  pause
  exit /b 1
)

echo Pasta do projeto encontrada.
echo.
pause

echo.
echo [1/2] Removendo as paginas do lugar antigo...

if exist "app\page.tsx"           del /q "app\page.tsx"
if exist "app\not-found.tsx"      del /q "app\not-found.tsx"
if exist "app\sobre"              rmdir /s /q "app\sobre"
if exist "app\contato"            rmdir /s /q "app\contato"
if exist "app\financiamento"      rmdir /s /q "app\financiamento"
if exist "app\imoveis"            rmdir /s /q "app\imoveis"

echo       pronto.
echo.
echo [2/2] Copiando os arquivos novos...

xcopy /e /i /y /q "correcoes\app" "app" >nul
if errorlevel 1 (
  echo [ERRO] Falha ao copiar. A pasta "correcoes" esta aqui do lado?
  pause
  exit /b 1
)

echo       pronto.
echo.
echo ============================================================
echo   ARQUIVOS APLICADOS
echo ============================================================
echo.
echo Agora rode, um comando por vez:
echo.
echo    npm run build
echo    git add -A
echo    git commit -m "corrige layout do cabecalho e responsividade"
echo    git push
echo.
echo IMPORTANTE: use  git add -A  (com o -A)
echo Sem isso o Git nao registra os arquivos que sairam do lugar.
echo.
pause
