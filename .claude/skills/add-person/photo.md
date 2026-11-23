# A person's photo

The committed photo is as public as the published one, and git history is permanent, so the photo enters the repository already stripped of its embedded metadata (camera, author, location).

## 1. Write the stripped photo

Write it beside the person's file, under the person's file name and the extension of the photo given:

```bash
node -e "import('sharp').then(({ default: sharp }) => sharp(process.argv[1]).rotate().toFile(process.argv[2]))" <the photo given> content/members/<file-name>.<extension>
```

The command reads one path and writes another: a photo already lying at the target path is first moved out to `.builds/`.

Then name the stripped file in the `photo` field, and print the metadata it still carries:

```bash
node -e "import('sharp').then(async ({ default: sharp }) => { const m = await sharp(process.argv[1]).metadata(); console.log(['exif', 'icc', 'iptc', 'xmp'].filter((k) => m[k])); })" content/members/<file-name>.<extension>
```

Done when: the second command prints `[]`, and `git status --short` shows the stripped photo as the only copy.
