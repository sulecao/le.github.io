#! /usr/bin/env sh
# 确保脚本抛出遇到的错误
# bash deploy.sh
set -e
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'
# git push -f git@github.com:sulecao/sulecao.github.io.git master
git push -f git@gitee.com:caolele/caolele.git master
cd -