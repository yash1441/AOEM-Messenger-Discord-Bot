const {
	SlashCommandBuilder,
	MessageFlags,
	EmbedBuilder,
	PermissionFlagsBits,
	InteractionContextType,
	Colors,
	hyperlink,
} = require("discord.js");

module.exports = {
	cooldown: 5,
	category: "utility",
	data: new SlashCommandBuilder()
		.setName("massdm")
		.setDescription("Sends a direct message to all members of the server.")
		.addBooleanOption((option) =>
			option
				.setName("test")
				.setDescription("Send the message to yourself only")
				.setRequired(true),
		)
		.addRoleOption((option) =>
			option
				.setName("filter")
				.setDescription("Role to filter members by")
				.setRequired(true),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setContexts(InteractionContextType.Guild),

	async execute(interaction) {
		await interaction.reply({
			content: "Sending messages...",
			flags: MessageFlags.Ephemeral,
		});

		const filterRole = interaction.options.getRole("filter");
		const isTest = interaction.options.getBoolean("test");

		const content =
			"📢各位親愛的領主們，《世紀帝國M》上線即將一週年啦🎉\n\n首先，當然是感謝各位領主這近一年的陪伴和指教，\n團隊也在積極收集大家的意見，盼望能創造更好的“世紀帝國”⚔\n\n在一起共襄盛舉前，我們準備了一份調查問卷，想更了解領主們的心聲💭\n還請領主們在收到問卷後撥空填寫，一起為更好、更強大的帝國而努力！💪\n" +
			hyperlink(
				"https://forms.gle/L9oXScsYHvKmK7xs6",
				"https://forms.gle/L9oXScsYHvKmK7xs6",
			) +
			"\n\n《世紀帝國M》營運團隊 敬上";

		const embed = new EmbedBuilder()
			.setTitle("📢各位親愛的領主們，《世紀帝國M》上線即將一週年啦🎉")
			.setDescription(
				"首先，當然是感謝各位領主這近一年的陪伴和指教，\n團隊也在積極收集大家的意見，盼望能創造更好的“世紀帝國”⚔\n\n在一起共襄盛舉前，我們準備了一份調查問卷，想更了解領主們的心聲💭\n還請領主們在收到問卷後撥空填寫，一起為更好、更強大的帝國而努力！💪\n" +
					hyperlink(
						"https://forms.gle/L9oXScsYHvKmK7xs6",
						"https://forms.gle/L9oXScsYHvKmK7xs6",
					) +
					"\n\n《世紀帝國M》營運團隊 敬上",
			)
			.setColor(Colors.Default)
			.setTimestamp();

		if (isTest && interaction.user.id == process.env.MY_ID) {
			await interaction.user.send({ content: content /* embeds: [embed] */ });
			await interaction.editReply({
				content: "Test message sent to yourself.",
			});
			return;
		} else if (isTest) {
			await interaction.user.send({
				content: "You are not authorized to use the test option.",
			});
			await interaction.editReply({
				content: "Test message sent to yourself.",
			});
			return;
		}

		await interaction.guild.members.fetch();

		const membersWithRole = interaction.guild.members.cache.filter(
			(member) => member.roles.cache.has(filterRole.id) && !member.user.bot,
		);

		let sentCount = 0;
		for (const member of membersWithRole.values()) {
			try {
				await member.send({ content: content /* embeds: [embed] */ });
				sentCount++;
			} catch (err) {
				// Ignore DM failures (user may have DMs disabled)
			}
		}

		await interaction.editReply({
			content: `Sent DMs to ${sentCount} members with the role ${filterRole.name}.`,
		});
	},
};
