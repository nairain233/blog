---
title: 右键菜单里新建文件的管理
published: 2025-12-23
description: 利用修改注册表来达到修改右键菜单。
tags:
  - Windows
  - 右键菜单
  - 注册表
category: 电脑知识
draft: false
---

## 前言
:::note[为什么我会写这篇博客呢]
因为我的新建菜单出现了office2003的选项，我想把他删掉。
:::

:::note[为什么会遇到这种情况呢]
在注册表中可以看到WPS是罪魁祸首。
:::

## 具体步骤
1. **win+r**打开命令行，输入`regedit`打开命令行
2. 进入注册表程序后，打开 **计算机\HKEY_CLASSES_ROOT**  目录
3. 比如我要删除.doc 就打开 **计算机\HKEY_CLASSES_ROOT\.doc\Word.Document.8** 这个目录，删除下项**ShellNew**
4. 检查是否生效

## 如何恢复呢  
比如我想删除.doc，但是不小心删除了.docx，那么直接逆操作就好了  
1. 在.doc项下面的的Word.Document.8项下面新建一个项，项名称为ShellNew,与删除之前一致即可
2. 在该项内新建一个字符串值，名称为NullFile（空文件），后面的数据为空即可
3. 此时回到桌面鼠标右键新建，发现之前删除的新建选项又回来了
   **PS:** 对于自己想要增加的新建选项，也可以直接找到文件格式对应的项在下面直接新建ShellNew这个项，再在ShellNew这个项下面新建NullFile的字符串值即可

## 参考文章  
[csdn](https://blog.csdn.net/Kinglen_R/article/details/102983259)