import type { FriendLink, FriendsPageConfig } from "../types/friendsConfig";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 是否显示底部自定义内容（friends.mdx 中的内容）
	showCustomContent: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
	randomizeSort: false,
};

// 友链配置
export const friendsConfig: FriendLink[] = [
	{
		title: "夏夜流萤",
		imgurl:
			"https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640",
		desc: "飞萤之火自无梦的长夜亮起，绽放在终竟的明天。",
		siteurl: "https://blog.cuteleaf.cn",
		tags: ["Blog"],
		weight: 9, // 权重，数字越大排序越靠前
		enabled: true, // 是否启用
	},
	{
		title: "AcoFork Blog",
		imgurl: "https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0",
		desc: "Protect What You Love.",
		siteurl: "https://2x.nz",
		tags: ["Blog"],
		weight: 9,
		enabled: true,
	},
	{
		title: "kiyukie'Blog",
		imgurl: "https://cdn.nodeimage.com/i/Q6NDWWd1h3I18zBNTwxFJABm5iKuGkuW.webp",
		desc: "剑气纵横三万里，一剑光寒十九洲。",
		siteurl: "https://blog.030666.xyz",
		tags: ["Blog"],
		weight: 9,
		enabled: true,
	},
	{
		title: "NNNullptr南",
		imgurl: "https://www.xnmoe.com/assets/images/pfp.png",
		desc: "数学生的古早风格个人站",
		siteurl: "https://xnmoe.com",
		tags: ["Blog"],
		weight: 9,
		enabled: true,
	},
	{
		title: "Firefly Docs",
		imgurl: "https://docs-firefly.cuteleaf.cn/logo.png",
		desc: "Firefly主题模板文档",
		siteurl: "https://docs-firefly.cuteleaf.cn",
		tags: ["Docs"],
		weight: 8,
		enabled: false,
	},
	{
		title: "忘川河畔",
		imgurl: "https://been.ee/link/flower.jpg",
		desc: "木已成舟，渡我者何人？",
		siteurl: "https://been.ee",
		tags: ["Blog"],
		weight: 8,
		enabled: true,
	},

];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
