import {
	FC,
	ReactNode,
	useEffect,
	useState,
	useMemo,
	memo,
	useRef,
} from "react";
import { marked, MarkedOptions } from "marked";
import DOMPurify from "dompurify";
import buildClassName from "@/shared/lib/buildClassName";

interface MessageTextProps {
	children: string;
	className?: string;
	allowHTML?: boolean;
	loadingComponent?: ReactNode;
	errorComponent?: ReactNode;
	/** Enable syntax highlighting for code blocks */
	enableSyntaxHighlight?: boolean;
	/** Optionally override the allowed HTML tags */
	allowedTags?: string[];
	/** Optionally override the allowed HTML attributes */
	allowedAttributes?: string[];
}

const defaultAllowedTags = [
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"blockquote",
	"p",
	"a",
	"ul",
	"ol",
	"nl",
	"li",
	"b",
	"i",
	"strong",
	"em",
	"strike",
	"code",
	"hr",
	"br",
	"div",
	"table",
	"thead",
	"tbody",
	"tr",
	"th",
	"td",
	"pre",
	"span",
	"img",
];
const defaultAllowedAttributes = [
	"href",
	"src",
	"alt",
	"title",
	"class",
	"target",
	"data-title",
];

const MessageText: FC<MessageTextProps> = ({
	children,
	className,
	allowHTML = true,
	loadingComponent,
	errorComponent,
	enableSyntaxHighlight = false,
	allowedTags,
	allowedAttributes,
}) => {
	const messageRef = useRef<HTMLDivElement>(null);
	const [parsedContent, setParsedContent] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Create a renderer instance and add custom methods without using spread.
	const renderer = useMemo(() => {
		const r = new marked.Renderer();
		// Override the image method
		r.image = ({
			href,
			title,
			text,
		}: {
			href: string;
			title: string | null;
			text: string;
		}) =>
			`<img src="${href}" alt="${text}" ${
				title ? `data-title="${title}"` : ""
			} class="responsive-image" loading="lazy" />`;
		return r;
	}, []);

	const markedOptions = useMemo<MarkedOptions>(() => {
		const options: MarkedOptions = {
			renderer: renderer,
			async: true,
			breaks: true,
			gfm: true,
		};

		if (enableSyntaxHighlight) {
			/// future
		}

		return options;
	}, [renderer, enableSyntaxHighlight]);

	useEffect(() => {
		let isMounted = true;

		const parseContent = async () => {
			try {
				setIsLoading(true);
				setError(null);

				// Asynchronously parse the markdown content.
				const parsed = await marked.parse(children, markedOptions);

				// Sanitize the HTML output.
				const cleanHTML = DOMPurify.sanitize(parsed, {
					ALLOWED_TAGS: allowHTML ? allowedTags || defaultAllowedTags : [],
					ALLOWED_ATTR: allowedAttributes || defaultAllowedAttributes,
				});

				if (isMounted) {
					setParsedContent(cleanHTML);
					setIsLoading(false);
				}
			} catch (err) {
				console.log(err);

				if (isMounted) {
					setError(
						err instanceof Error ? err.message : "Failed to parse content",
					);
					setIsLoading(false);
				}
			}
		};

		parseContent();

		return () => {
			isMounted = false;
		};
	}, [children, allowHTML, markedOptions, allowedTags, allowedAttributes]);

	if (isLoading) {
		return (
			loadingComponent || (
				<div className="flex justify-center p-4">(Loading...)</div>
			)
		);
	}

	if (error) {
		return (
			errorComponent || (
				<div className="error p-4 text-red-600">
					Error rendering content: {error}
				</div>
			)
		);
	}

	return (
		<div
			ref={messageRef}
			className={buildClassName(
				"prose prose-neutral dark:prose-invert x-w-none break-words whitespace-normal flex-wrap",
				className,
			)}
			style={{ maxWidth: "inherit" }}
			dangerouslySetInnerHTML={{ __html: parsedContent }}
		/>
	);
};

export default memo(MessageText);
