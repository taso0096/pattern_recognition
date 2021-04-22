# pattern_recognition
パターン認識の課題用プロジェクトです。

# インストール
```bash
git clone https://github.com/taso0096/pattern_recognition.git
cd pattern_recognition
```

# 使い方
## 起動
```bash
docker-compose up -d
```
Vue CLIの起動等はホストでやってください。

## Firebase設定
```bash
docker-compose exec firebase firebase login --no-localhost
docker-compose exec firebase firebase use --add
? Which project do you want to add? <project-id>
? What alias do you want to use for this project? (e.g. staging) default
```

## Firebaseエミュレーション
```bash
docker-compose exec firebase firebase emulators:start
```

## Goビルド
```bash
docker-compose exec go bash -c 'GOOS=js GOARCH=wasm go build -o wasm/<filename>.wasm <filename>.go'
```

# 作者
[@taso0096](https://twitter.com/taso0096)
