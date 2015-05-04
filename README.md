## Dropbox 

Time spent: `<15 hours>`

### Features

#### Required

- [done] Client can make GET requests to get file or directory contents
- [done] Client can make HEAD request to get just the GET headers 
- [done] Client can make POST requests to create new directories and files with content
- [done] Client can make PUT requests to update the contents of a file
- [done] Client can make DELETE requests to delete files and folders
- [done] Server will serve from `--dir` or cwd as root
- [done] Client will sync from server over TCP to cwd or CLI `dir` argument

### Optional

- [ ] Client and User will be redirected from HTTP to HTTPS
- [ ] Server will sync from client over TCP
- [ ] Client will preserve a 'Conflict' file when pushed changes preceeding local edits
- [ ] Client can stream and scrub video files (e.g., on iOS)
- [ ] Client can download a directory as an archive
- [ ] Client can create a directory with an archive
- [ ] User can connect to the server using an FTP client


### Walkthrough (Note: I use POST to create, PUT to update as opposed in the assignment video walkthrogh)

![Video Walkthrough](https://github.com/annelin07/dropbox-demo/blob/master/dropboxWT.gif)

