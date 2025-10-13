const {
	SlashCommandBuilder,
	MessageFlags,
	EmbedBuilder,
	PermissionFlagsBits,
	InteractionContextType,
	Colors,
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
				.setRequired(true)
		)
		.addRoleOption((option) =>
			option
				.setName("filter")
				.setDescription("Role to filter members by")
				.setRequired(true)
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

		const embed = new EmbedBuilder()
			.setTitle("Important Message")
			.setDescription("This is a mass DM sent to all members of the server.")
			.setColor(Colors.Default)
			.setTimestamp();

		if (isTest && interaction.user.id == process.env.MY_ID) {
			await interaction.user.send({ embeds: [embed] });
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
			(member) => member.roles.cache.has(filterRole.id) && !member.user.bot
		);

		let sentCount = 0;
		for (const member of membersWithRole.values()) {
			try {
				await member.send({ embeds: [embed] });
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
