module.exports = {
  name: 'common-rxjs-utility',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/common/rxjs-utility',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
