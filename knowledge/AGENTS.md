# 项目约定

- 默认使用中文交流。
- 默认不主动新建说明文档，除非用户明确要求。
- 所有 Markdown 与代码文件默认使用 `UTF-8` 无 BOM。
- 若子目录存在更近层级的 `AGENTS.md`，优先遵循更近规则。

# 写作原则

- 以“知识点”为单位组织内容，标题要具体、概括、可检索。
- 避免笼统标题，如“易错点”“实践建议”“怎么记”等。
- 内容要完整，不写骨架、不堆资料、不留占位语。
- 首稿就要写成可直接学习、复习的完整内容，不先留“后续补充”式空壳。
- 先讲清概念，再给示例、对比、边界和应用。
- 只在真正有助于理解时使用表格、代码块、Mermaid、列表等形式，不为了形式而形式。

# 结构规则

- 标题层级从 `##` 开始，只使用偶数级标题：`## / #### / ######`。
- 文档标题和正文首个标题不要机械重复，正文应直接进入知识拆分。
- 目录内相近主题可合并，但不要为了控制篇数牺牲知识边界。
- 复杂主题允许补到三级标题，但层级风格必须统一。

# 正文文档标题规则

- 正文文档标题指目录下除 `README.md` 外的知识文档标题和文件名。
- 标题尽量简短，优先概括一个明确知识点、概念、机制、语法、API、协议或工具能力。
- 标题不要写成句子，不使用“什么是”“如何使用”“常见问题”“工程应用”“实践建议”“完整指南”等宽泛表达。
- 标题中的技术名词、API、框架名、协议名、缩写和专有概念要保留原有含义，不为了统一中文而随意翻译。
- 已有通用中文译名的概念可以使用中文；容易失真的概念优先保留英文，必要时使用“中文 + English”形式，如 `闭包 Closure`、`事件循环 Event Loop`、`虚拟 DOM`。
- 同一目录下的标题要覆盖基础、核心和扩展三个层次，但每个标题仍然只表达一个知识点。
- 新增或调整标题前，先查看同级 README 和已有文档标题，保持学习顺序、粒度和命名风格一致。

# README 规则

- README 负责目录导航、学习顺序和文档入口，不承载与子文档重复的大段正文。
- 新增、删除、重命名、移动目录或文档后，必须同步更新对应 README，确保顺序、链接和结构与实际内容一致。

# 链接规则

- Obsidian 双链只在存在真实知识关联时使用。
- 链接目标保留编号，正文显示优先使用无编号别名，如 `[[1.1.7 无障碍|无障碍]]`。
- 不要为了“关联”而关联，更不要单独设置“关联知识”板块。
- 链接要嵌入上下文，真正说明前置关系、影响关系或相邻依赖。

# 内容规则

- 优先吸收官方文档，其次可参考高质量 GitHub 文档、优质教程与总结类资料。
- 不单列“参考资料”板块，资料只用于正文吸收与整理。
- 补厚内容时，必须先判断新增内容能否放入已有标题或相近标题下；只有确实属于新的扩展知识点、且不适合并入现有结构时，才新增一段标题和正文。
- 同一主题内，优先写清定义、用途、常见写法、边界、易混点和实践判断。
- 吸收资料后要主动扩展相关知识点，补齐前置概念、相邻概念、边界条件、对比关系、典型示例和应用场景，不只做摘要式整理。
- 内容展示要高密度，但必须可读、可复习、可检索。

# 资料来源规则

- 写技术文档前，优先查对应主题的一手资料，再吸收二手总结。
- 一手资料优先级：标准 / 规范 / 协议 > 官方文档 > 官方教程与 Reference > 官方博客与 Release Notes > 高质量二手资料 > 中文资料。
- 对可能过时的 API、版本差异、最佳实践、安全策略、平台行为，必须优先查最新官方资料再写。
- 二手资料不能直接替代官方资料；如果二者冲突，以官方文档、标准或当前版本文档为准。
- 不要把资料来源堆进正文，不单独写“参考资料”。最终文档应体现为消化后的知识结构，而不是资料摘抄。
- 除官方资料外，还要主动补充经典 GitHub 仓库、体系完整的教程站/课程、长期更新且被广泛引用的技术博客和专栏，用来补齐知识边界、工程经验和学习路径。
- 每个主题尽量形成“官方资料 + 经典仓库 + 完整教程/课程 + 高认可度博客/专栏”的组合，而不是只看单一来源。
- 补充资料优先收录长期维护、覆盖面完整、结构清晰、社区引用度高的来源；对于基础入门和概念铺垫，也可以纳入现代 JavaScript 教程、ES6 教程、菜鸟教程这类被广泛使用的入门教程，但仍然只作为辅助资料。
- **前端 / Web**：优先参考 MDN Web Docs、web.dev、WHATWG/W3C 规范、浏览器厂商文档；补充可看 `kamranahmedse/developer-roadmap`、`getify/You-Dont-Know-JS`、`airbnb/javascript`、`freeCodeCamp`、`The Odin Project`、`Full Stack Open`、`javascript.info`、阮一峰《ES6 入门》、菜鸟教程，以及 `Smashing Magazine`、`CSS-Tricks`、`LogRocket`、张鑫旭、Huli。
- **移动端 / 跨端**：优先参考 Android Developers、Apple Developer Documentation、Flutter、React Native、Electron、PWA 相关官方文档；补充可看 `facebook/react-native`、`flutter/flutter`、`expo/expo`、`electron/electron`，以及 Flutter Codelabs、Hacking with Swift、Swift by Sundell、鸿洋、郭霖、谷歌开发者博客。
- **后端 - Node**：优先参考 Node.js 官方文档、API Reference、npm / pnpm 官方文档，以及 Express、Koa、NestJS、Fastify 等框架官方文档；补充可看 `nodejs/node`、`goldbergyoni/nodebestpractices`、`expressjs/express`、`fastify/fastify`、`nestjs/nest`，以及 Node.js Best Practices、Node.js Design Patterns、LogRocket、Better Stack。
- **后端 - Python**：优先参考 Python 官方文档、PEP、标准库文档，以及 Django、Flask、FastAPI、asyncio、typing、packaging 相关官方说明；补充可看 `vinta/awesome-python`、`django/django`、`pallets/flask`、`fastapi/fastapi`、`pydantic/pydantic`、`tiangolo/full-stack-fastapi-template`，以及 Real Python、Miguel Grinberg、Hynek Schlawack、Talk Python、廖雪峰。
- **后端 - Java**：优先参考 Java SE、Java Language Specification、OpenJDK 资料，以及 Spring、Maven、Gradle 等官方文档；补充可看 `spring-projects/spring-boot`、`iluwatar/java-design-patterns`、`eugenp/tutorials`，以及 Baeldung、Hollis、纯洁的微笑、Martin Fowler。
- **后端 - Go**：优先参考 Go 官方文档、Go Blog、标准库文档，以及 Gin、Echo、Fiber 等框架官方文档；补充可看 `golang/go`、`avelino/awesome-go`、`uber-go/guide`、`go101/go101`、`mmcgrana/gobyexample`，以及 Go by Example、Go 101、Dave Cheney、煎鱼、鸟窝。
- **数据库**：优先参考 MySQL、PostgreSQL、Redis、MongoDB、Elasticsearch 等官方手册、Release Notes、Best Practices、性能与运维文档；SQL、事务、索引、锁、复制、备份、优化等以官方资料为准；补充可看 `dhamaniasad/awesome-databases`、`pingcap/tidb`、`redis/redis`、`postgres/postgres`、`mysql/mysql-server`，以及 Use The Index, Luke!、Percona Blog、PingCAP Blog、Cybertec、Shay Banon 相关内容。
- **部署运维**：优先参考 Linux man pages、发行版文档、Nginx、Docker、Kubernetes、GitHub Actions、Prometheus、Grafana、OpenTelemetry、云厂商官方文档；补充可看 `ramitsurana/awesome-kubernetes`、`kelseyhightower/kubernetes-the-hard-way`、`bregman-arie/devops-exercises`、`Alliedium/awesome-devops`，以及 CNCF Blog、Kelsey Hightower、Google SRE、AWS Architecture Blog、云原生社区。
- **计算机基础**：优先参考 RFC、IETF / IEEE / ECMA / ISO 等标准与规范、操作系统与编译器官方文档、经典教材与权威课程资料；补充可看 `ossu/computer-science`、`csdiy.wiki`、MIT OpenCourseWare、CS50、Teach Yourself CS、`cppreference`，以及 陈皓（酷壳）、王垠、Beej's Guide。
- **系统设计**：优先参考云厂商架构中心、SRE / 可观测性 / 安全最佳实践、分布式系统论文、开源项目 Design Doc、官方 Whitepaper；补充可看 `donnemartin/system-design-primer`、`martinfowler.com`、High Scalability、ByteByteGo、Google SRE 相关资料，以及 小林 coding、陈皓、InfoQ。
- **工程实践**：优先参考 Git、GitHub、测试框架、调试器、IDE、静态分析、格式化工具、重构工具等官方文档，以及本仓库已有工程约定；补充可看 `google/styleguide`、`airbnb/javascript`、`ryanmcdermott/clean-code-javascript`、`refactoring.guru`，以及 Martin Fowler、Kent C. Dodds、Thoughtworks 技术雷达。
- **AI 开发**：优先参考模型平台与 SDK 的官方文档、API Reference、Cookbook、Release Notes，以及 Hugging Face、LangChain、LlamaIndex 等框架官方文档；补充可看 `openai/openai-cookbook`、`huggingface/transformers`、`langchain-ai/langchain`、`run-llama/llama_index`、`dair-ai/Prompt-Engineering-Guide`，以及 Hugging Face Course、Jay Alammar、Lilian Weng、Sebastian Raschka、Andrej Karpathy。
- **项目沉淀**：优先参考本仓库已有项目记录、架构图、变更单、提交记录、复盘文档、监控面板、日志、告警、接口文档、数据库 schema、部署脚本与真实代码实现；必要时再对照开源项目的 README、Design Doc、ADR、RFC、Runbook、Postmortem 模板。

# 资料使用方式

- 官方文档用于确认定义、API 行为、边界条件、版本差异。
- GitHub 高质量仓库用于补充学习路径、主题覆盖、常见问题和工程化视角。
- 优质教程用于帮助组织讲解顺序、补足入门视角和中文表达，但只选完整度高、长期维护、被广泛引用的来源。
- 资料吸收时尽量对照“官方资料 + 经典仓库 + 教程 + 博客”，保证内容既准确又好学。
- 安全类内容必须结合攻击条件、防护边界、服务端责任和浏览器机制，不只写概念。
- 框架类内容必须同时覆盖基础用法、运行机制、工程边界和常见误区。
- 示例代码应尽量小而完整，能体现真实使用场景，不写为了展示语法而存在的孤立片段。

# 校验规则

- 每篇完成后检查文件非空。
- 检查是否出现 `# / ### / #####` 这类禁止标题层级。
- 检查是否出现独立的“参考资料”或“关联知识”板块。
- 检查双链是否自然、必要、显示是否简洁。
- 检查代码块语言标识是否正确。
- 检查末尾是否有未完成、未收束、占位式内容。

# 执行原则

- 按目录顺序推进，先统一风格，再扩展范围。
- 一次只处理一种意图，探索、决策、执行、校验不要混在一起。
- 先修根因，再补表面问题。
- 尽量保持最小改动范围，避免无关文件被波及。
