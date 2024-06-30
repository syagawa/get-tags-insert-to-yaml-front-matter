# Get tags and insert tags to Yaml Front Matter

## requires

* docker

## usage

```bash

$ git clone <this repository>

$ cd <this repository directory>

# add dictionary
$ cp ./samples/add.csv ./csv/add.csv

# add exclude word list
$ cp ./samples/list.exclude.txt ./excludes/list.exclude.txt

# options
$ cp ./scripts/options.default.mjs ./scripts/options.mjs

# add target files
$ cp ./samples/test.md ./targets/

# go
$ chmod +x ./build-and-go.sh
$ ./build-and-go.sh
```

