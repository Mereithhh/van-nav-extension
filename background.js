/*
 * @Author: mereith
 * @Date: 2022-04-27 19:46:05
 * @LastEditTime: 2022-04-27 19:46:06
 * @LastEditors: mereith
 * @Description: nice
 * @FilePath: \van-nav-chrome\background.js
 */
let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});