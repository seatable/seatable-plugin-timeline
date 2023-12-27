# seatable-plugin-timeline

The plugin to show timeline.

## 项目运行说明

1. 克隆到本地

    ```git clone git@github.com:seatable/seatable-plugin-timeline.git```

2. 安装依赖

    ```npm install```

3. 执行运行命令

    ```npm run start 或者 npm start```

## seatable-plugin-timeline 打包


1. 在修改 plugin-config 中 info.json 文件

   ```json
    {
      "name": "timeline",
      "version": "1.x.x",
      "display_name": "",
      "description": "",
    }
   ```

    **注: 具体参数如下**

    * name: 插件名字，不能和其他插件冲突，只能包含字母、数字和下划线
    * version: 版本号
    * display_name: 显示的名称
    * description: 插件描述

2. 打包插件

    **⚠️注意：打包插件需遵循如下步骤**

    2.1 修改 plugin-config/info.json 中的 version 为指定版本号
    
    2.2 修改 package.json 中的 version 为指定版本号

    2.3 运行 npm install 命令保证项目中安装的是最新依赖

    2.4 运行 npm run build-plugin 打包插件
