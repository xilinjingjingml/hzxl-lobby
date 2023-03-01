'use strict';

var Fs = require("fire-fs");
var Path = require("fire-path");

var inject_script = `
(function () {
    if (typeof window.jsb === 'object') {
        var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            var paths = JSON.parse(hotUpdateSearchPaths);
            jsb.fileUtils.setSearchPaths(paths);

            var fileList = [];
            var storagePath = paths[0] || '';
            var tempPath = storagePath + '_temp/';
            var baseOffset = tempPath.length;

            if (jsb.fileUtils.isDirectoryExist(tempPath) && !jsb.fileUtils.isFileExist(tempPath + 'project.manifest.temp')) {
                jsb.fileUtils.listFilesRecursively(tempPath, fileList);
                fileList.forEach(srcPath => {
                    var relativePath = srcPath.substr(baseOffset);
                    var dstPath = storagePath + relativePath;

                    if (srcPath[srcPath.length] == '/') {
                        cc.fileUtils.createDirectory(dstPath)
                    }
                    else {
                        if (cc.fileUtils.isFileExist(dstPath)) {
                            cc.fileUtils.removeFile(dstPath)
                        }
                        cc.fileUtils.renameFile(srcPath, dstPath);
                    }
                })
                cc.fileUtils.removeDirectory(tempPath);
            }
        }
    }
})();
`;

module.exports = {
    load: function () {
        // 当 package 被正确加载的时候执行
    },

    unload: function () {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'editor:build-finished': function (event, target) {
			if ("android" !== target.platform && "ios" !== target.platform)
				return
				
			let total = 4
			let curr = 0
			let callback = ()=> {
				curr++
				if (curr === total) {
					Editor.info("Build Success!")
				}
			}
			
            var root = Path.normalize(target.dest);
            var url = Path.join(root, "main.js");
            Fs.readFile(url, "utf8", function (err, data) {
                if (err) {
                    throw err;
                }

                var newStr = inject_script + data;
				
				newStr = newStr.replace(/require\('src\/settings.(\w*\.*)*.js'\);/g, `require('src/settings.js');`)
				newStr = newStr.replace(/require\('src\/cocos2d-jsb.(\w*\.*)*.js'\);/g, `require('src/cocos2d-jsb.js');`)
				
                Fs.writeFile(url, newStr, function (error) {
                    if (err) {
                        throw err;
                    }
                    Editor.log("SearchPath updated in built main.js for hot update");
					callback()
                });
            });
			let cp = require("child_process")
			cp.exec(`node --version`, (error, stdout, stderr) => {
					if (error) {
						Editor.log(`执行的错误: ${error}`);
						return;
					}
					Editor.log(`stdout: ${stdout}`);
					callback
				})
			Fs.readdir(root, (err, files)=>{
				for (let f of files) {
					if (/^project.(\w*\.*)*manifest$/.test(f)) {
						Fs.unlinkSync(Path.join(root, f))
					} else if (/^version.(\w*\.*)*manifest$/.test(f)) {
						Fs.unlinkSync(Path.join(root, f))
					}
				}
				
				let cp = require("child_process")
				let packageUrl = Editor.url('packages://hot-update/', 'utf8')
				packageUrl = Path.join(packageUrl, "version_generator.js")
				cp.exec(`node ${packageUrl} -v 1.0.0 -u http://your-server-address/tutorial-hot-update/remote-assets/ -s ${root} -d ${root}`, (error, stdout, stderr) => {
					if (error) {
						Editor.log(`执行的错误: ${error}`);
						return;
					}
					Editor.log(`stdout: ${stdout}`);
					Fs.copyFileSync(Path.join(root, "project.manifest"), Path.join(root, "project.internal.manifest"))
					Fs.copyFileSync(Path.join(root, "version.manifest"), Path.join(root, "version.internal.manifest"))
					
					callback()
				})
			})
			
			Fs.readdir(Path.join(root, "src"), (err, files)=>{
				for (let f of files) {
					if (/^cocos2d-jsb.(\w*\.*)*js$/.test(f)) {
						Fs.renameSync(Path.join(root, "src", f), Path.join(root, "src", "cocos2d-jsb.js"))
					} else if (/^settings.(\w*\.*)*js$/.test(f)) {
						Fs.renameSync(Path.join(root, "src", f), Path.join(root, "src", "settings.js"))
					}
				}
				
				callback()
			})
        }
    }
};