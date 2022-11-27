import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

import { query as q} from "faunadb";

import { fauna } from "../../../services/fauna";

export const authOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_CLIENT_ID || "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET || "" ,
			authorization: { params: { scope: "read:user" } }
		}),
	],
	callbacks: {
		async signIn({ user }: any) {
			try {
				const { email } = user;

				await fauna.query(
					q.If(
						q.Not(
							q.Exists(
								q.Match(
									q.Index("user_by_email"),
									q.Casefold(user.email)
								)
							)
						),
						q.Create(
							q.Collection("users"),
							{ data: { email } }
						),
						q.Get(
							q.Match(
								q.Index("user_by_email"),
								q.Casefold(user.email)
							)
						)
					)
				);

				return true;
			} catch(err: any) {
				console.log("err =>> ", err);
				return false;
			}
		},
	}
};
export default NextAuth(authOptions);