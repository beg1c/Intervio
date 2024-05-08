import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

import 'node_modules/codemirror/mode/javascript/javascript.js';
import 'node_modules/codemirror/mode/python/python.js';
import 'node_modules/codemirror/mode/clike/clike.js';
import 'node_modules/codemirror/mode/javascript/javascript.js';
import 'node_modules/codemirror/mode/perl/perl.js';
import 'node_modules/codemirror/mode/php/php.js';
import 'node_modules/codemirror/mode/ruby/ruby.js';
import 'node_modules/codemirror/mode/sql/sql.js';
import 'node_modules/codemirror/mode/markdown/markdown.js';
import 'node_modules/codemirror/addon/selection/active-line';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
