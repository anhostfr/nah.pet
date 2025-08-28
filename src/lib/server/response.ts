import { fail } from '@sveltejs/kit';

type Serializable = Record<string, unknown> | undefined;

export function actionSuccess(messageKey: string, data?: Serializable) {
	return { success: true, messageKey, ...(data ?? {}) } as const;
}

export function actionFail(status: number, messageKey: string, data?: Serializable) {
	return fail(status, { success: false, messageKey, ...(data ?? {}) });
}
