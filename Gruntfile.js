module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		uglify: {
			options: {
				mangle: true,
				sourceMap: false,
				compress: {
					drop_console: true
				}
			},
			dist: {
				files: {
					'./dist/form-saver.min.js' : ['./src/form-saver.js']
				}
			}
		},
		watch: {
			scripts: {
				files: ['./src/form-saver.js'],
				tasks: ['uglify']
			}
		},
		notify_hooks: {
			options: {
				enabled: true,
				max_jshint_notifications: 2,
				title: '<%= pkg.name %>',
				success: true,
				duration: 1
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-notify');

	grunt.task.run('notify_hooks');
	
	grunt.registerTask('default', ['uglify']);
	grunt.registerTask('js', ['uglify']);
}