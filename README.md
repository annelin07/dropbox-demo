## Dropbox [(raw)](https://gist.github.com/CrabDude/040af9c1b93e350608ff/raw)

This is a basic Dropbox clone to sync files across multiple remote folders.

Time spent: `<6 hours>`

### Features

#### Required

- [done] Client can make GET requests to get file or directory contents
- [done ] Client can make HEAD request to get just the GET headers 
- [done ] Client can make PUT requests to create new directories and files with content
- [done ] Client can make POST requests to update the contents of a file
- [done ] Client can make DELETE requests to delete files and folders
- [done ] Server will serve from `--dir` or cwd as root
- [ ] Client will sync from server over TCP to cwd or CLI `dir` argument

### Optional

- [ ] Client and User will be redirected from HTTP to HTTPS
- [ ] Server will sync from client over TCP
- [ ] Client will preserve a 'Conflict' file when pushed changes preceeding local edits
- [ ] Client can stream and scrub video files (e.g., on iOS)
- [ ] Client can download a directory as an archive
- [ ] Client can create a directory with an archive
- [ ] User can connect to the server using an FTP client


### Walkthrough

![Video Walkthrough](https://vimeo.com/user39231823/videos)